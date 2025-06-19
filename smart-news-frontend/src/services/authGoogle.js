import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error('Firebase signInWithGoogle failed:', error);
    throw error;
  }
};
