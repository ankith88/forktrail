const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function processImageToTransparentBuffer(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outputBuffer = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Enqueue all border pixels
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  while (queue.length > 0) {
    const cy = queue.pop();
    const cx = queue.pop();
    const idx2d = cy * width + cx;
    if (visited[idx2d]) continue;
    visited[idx2d] = 1;

    const idx = idx2d * channels;
    const r = outputBuffer[idx];
    const g = outputBuffer[idx + 1];
    const b = outputBuffer[idx + 2];

    // Dark green (#025259) or salmon (#FF947A) stops the flood fill
    const isDarkGreen = r < 70 && g > 55 && b > 55;
    const isBackground = r > 185 && g > 175 && b > 165 && !isDarkGreen;

    if (isBackground) {
      outputBuffer[idx + 3] = 0; // Transparent alpha

      const neighbors = [
        [cx - 1, cy],
        [cx + 1, cy],
        [cx, cy - 1],
        [cx, cy + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (!visited[ny * width + nx]) {
            queue.push(nx, ny);
          }
        }
      }
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
  console.log('🎨 Starting Palatero Brand Asset Generation...');

  const sourcePath = path.join(__dirname, '../public/palatero-brand.png');
  const publicDir = path.join(__dirname, '../public');
  const srcAppDir = path.join(__dirname, '../src/app');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source file public/palatero-brand.png does not exist!');
    process.exit(1);
  }

  // 1. Crop Mark Bounding Box for Palatero Compass Seal (left: 170, top: 125, width: 515, height: 515)
  const markCropBox = {
    left: 170,
    top: 125,
    width: 515,
    height: 515,
  };

  // Crop Full Logo Bounding Box (left: 160, top: 120, width: 1080, height: 520)
  const fullLogoCropBox = {
    left: 160,
    top: 120,
    width: 1080,
    height: 520,
  };

  console.log('Extracting logo mark...');
  const croppedMarkBuffer = await sharp(sourcePath)
    .extract(markCropBox)
    .toBuffer();

  const transparentMarkPng = await processImageToTransparentBuffer(croppedMarkBuffer);
  const markBuffer = await transparentMarkPng.toBuffer();

  // Save public/logo-mark.png
  await sharp(markBuffer).toFile(path.join(publicDir, 'logo-mark.png'));
  console.log('✅ Generated public/logo-mark.png');

  console.log('Extracting full logo...');
  const croppedFullLogoBuffer = await sharp(sourcePath)
    .extract(fullLogoCropBox)
    .toBuffer();

  const transparentFullLogoPng = await processImageToTransparentBuffer(croppedFullLogoBuffer);
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

  // apple-touch-icon.png (180x180) - Solid dark green background `#025259` with crisp centered mark
  const markResized130 = await sharp(markBuffer)
    .resize(130, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 2, g: 82, b: 89, alpha: 1 }, // #025259 Deep Green
    },
  })
    .composite([{ input: markResized130, gravity: 'center' }])
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
      background: { r: 2, g: 82, b: 89, alpha: 1 }, // #025259
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
      background: { r: 2, g: 82, b: 89, alpha: 1 }, // #025259
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
      background: { r: 2, g: 82, b: 89, alpha: 1 }, // #025259
    },
  })
    .composite([{ input: markResizedMaskable, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('✅ Generated public/icon-maskable-512.png');

  console.log('✨ All Palatero brand assets generated successfully!');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});


