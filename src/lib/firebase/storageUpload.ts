import { storage } from './client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImageToStorage(
  file: File,
  userId: string,
  folder: string = 'photos'
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  if (!userId) {
    throw new Error('User ID is required to upload photos to Firebase Storage');
  }

  // Create a clean filename with timestamp
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `users/${userId}/${folder}/${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
