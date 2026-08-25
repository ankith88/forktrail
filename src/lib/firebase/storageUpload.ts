import { storage } from './client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Compresses and resizes an image file in the browser using HTML5 Canvas.
 * Reduces raw 5MB-15MB camera photos down to ~200KB-500KB WebP files.
 */
export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width <= 0 || height <= 0) {
        resolve(file);
        return;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const extension = blob.type === 'image/webp' ? '.webp' : '.jpg';
          const newName = file.name.replace(/\.[^/.]+$/, '') + extension;
          const compressedFile = new File([blob], newName, {
            type: blob.type,
            lastModified: Date.now(),
          });

          // Return compressed file only if it is actually smaller than original
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function uploadImageToStorage(
  file: File,
  userId: string,
  folder: string = 'photos',
  shouldCompress = true
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  if (!userId) {
    throw new Error('User ID is required to upload photos to Firebase Storage');
  }

  const fileToUpload = shouldCompress ? await compressImage(file) : file;

  // Create a clean filename with timestamp
  const cleanFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `users/${userId}/${folder}/${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, fileToUpload);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Uploads multiple images in parallel with controlled concurrency.
 */
export async function uploadImagesInParallel(
  files: File[],
  userId: string,
  folder: string = 'photos',
  concurrency: number = 3
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const results: string[] = new Array(files.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < files.length) {
      const idx = currentIndex++;
      try {
        results[idx] = await uploadImageToStorage(files[idx], userId, folder, true);
      } catch (err) {
        console.error(`Failed to upload photo index ${idx}:`, err);
        results[idx] = '';
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
  await Promise.all(workers);
  return results.filter(Boolean);
}

