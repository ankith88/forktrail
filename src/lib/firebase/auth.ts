import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isLiveFirebaseConfigured } from './client';

export async function loginWithGoogle(): Promise<User | null> {
  if (!isLiveFirebaseConfigured || !auth) {
    // Demo mode fallback user
    return {
      uid: 'demo_user_123',
      displayName: 'Food Explorer',
      email: 'explorer@palatero.app',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    } as unknown as User;
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User | null> {
  if (!isLiveFirebaseConfigured || !auth) {
    return {
      uid: `user_${Date.now()}`,
      displayName: email.split('@')[0],
      email,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    } as unknown as User;
  }

  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User | null> {
  if (!isLiveFirebaseConfigured || !auth) {
    return {
      uid: `user_demo`,
      displayName: email.split('@')[0],
      email,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    } as unknown as User;
  }

  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function logoutUser(): Promise<void> {
  if (isLiveFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (isLiveFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }
  callback(null);
  return () => {};
}
