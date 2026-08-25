const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function processImageToTransparentBuffer(inputBuffer, threshold = 245) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outputBuffer = Buffer.from(data);

  for (let i = 0; i < outputBuffer.length; i += channels) {
    const r = outputBuffer[i];
    const g = outputBuffer[i + 1];
    const b = outputBuffer[i + 2];

    // Check if pixel is white / near-white
    if (r >= threshold && g >= threshold && b >= threshold) {
      outputBuffer[i + 3] = 0; // Alpha = 0
    } else if (r > 200 && g > 200 && b > 200) {
      // Soft alpha transition for antialiased white edges
      const minVal = Math.min(r, g, b);
      const alphaFactor = (255 - minVal) / (255 - 200);
      outputBuffer[i + 3] = Math.round(255 * Math.max(0, Math.min(1, alphaFactor)));
    }
  }

  return sharp(outputBuffer, {
    raw: {
      width,
      height,
      channels,
    },
  }).png();
}

async function generateAssets() {
  console.log('🎨 Starting ForkTrail Brand Asset Generation...');

  const sourcePath = path.join(__dirname, '../public/forktrail-brand.png');
  const publicDir = path.join(__dirname, '../public');
  const srcAppDir = path.join(__dirname, '../src/app');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source file public/forktrail-brand.png does not exist!');
    process.exit(1);
  }

  // 1. Crop Mark Bounding Box (minY: 109, maxY: 456, minX: 551, maxX: 856)
  // Give comfortable padding around the mark icon
  const markCropBox = {
    left: 540,
    top: 100,
    width: 328,
    height: 366,
  };

  // Crop Full Logo Bounding Box (minY: 109, maxY: 642, minX: 434, maxX: 973)
  const fullLogoCropBox = {
    left: 420,
    top: 95,
    width: 568,
    height: 560,
  };

  console.log('Extracting logo mark...');
  const croppedMarkBuffer = await sharp(sourcePath)
    .extract(markCropBox)
    .toBuffer();

  const transparentMarkPng = await processImageToTransparentBuffer(croppedMarkBuffer, 245);
  const markBuffer = await transparentMarkPng.toBuffer();

  // Save public/logo-mark.png
  await sharp(markBuffer).toFile(path.join(publicDir, 'logo-mark.png'));
  console.log('✅ Generated public/logo-mark.png');

  console.log('Extracting full logo...');
  const croppedFullLogoBuffer = await sharp(sourcePath)
    .extract(fullLogoCropBox)
    .toBuffer();

  const transparentFullLogoPng = await processImageToTransparentBuffer(croppedFullLogoBuffer, 245);
  const fullLogoBuffer = await transparentFullLogoPng.toBuffer();

  // Save public/logo.png
  await sharp(fullLogoBuffer).toFile(path.join(publicDir, 'logo.png'));
  console.log('✅ Generated public/logo.png');

  // 2. Browser Favicons
  console.log('Generating favicons...');
  const favicon16Buffer = await sharp(markBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp(favicon16Buffer).toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✅ Generated public/favicon-16x16.png');

  const favicon32Buffer = await sharp(markBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp(favicon32Buffer).toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✅ Generated public/favicon-32x32.png');

  const favicon48Buffer = await sharp(markBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create src/app/favicon.ico multi-res
  const icoBuffer = await pngToIco([favicon16Buffer, favicon32Buffer, favicon48Buffer]);
  fs.writeFileSync(path.join(srcAppDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✅ Generated src/app/favicon.ico and public/favicon.ico');

  // 3. Mobile & PWA Icons
  console.log('Generating Mobile & PWA icons...');

  // apple-touch-icon.png (180x180) - Solid dark teal background `#025259` with crisp centered mark
  const markResized120 = await sharp(markBuffer)
    .resize(130, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 2, g: 82, b: 89, alpha: 1 }, // #025259
    },
  })
    .composite([{ input: markResized120, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png');

  // icon-192.png (192x192)
  const markResized140 = await sharp(markBuffer)
    .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 2, g: 82, b: 89, alpha: 1 },
    },
  })
    .composite([{ input: markResized140, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✅ Generated public/icon-192.png');

  // icon-512.png (512x512)
  const markResized370 = await sharp(markBuffer)
    .resize(370, 370, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 2, g: 82, b: 89, alpha: 1 },
    },
  })
    .composite([{ input: markResized370, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✅ Generated public/icon-512.png');

  // icon-maskable-512.png (512x512) with safe zone padding (mark size 300x300, ~60% of container)
  const markResizedMaskable = await sharp(markBuffer)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 2, g: 82, b: 89, alpha: 1 },
    },
  })
    .composite([{ input: markResizedMaskable, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('✅ Generated public/icon-maskable-512.png');

  console.log('✨ All brand assets generated successfully!');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
