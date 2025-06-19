import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebaseConfig';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result; // ✅ result harus mengandung result.user
  } catch (error) {
    console.error('Firebase signInWithGoogle failed:', error);
    throw error;
  }
};
