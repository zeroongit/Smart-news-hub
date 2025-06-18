import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const token = await user.getIdToken();

    return {
      username: user.displayName,
      email: user.email,
      token,
      profilePictureUrl: user.photoURL,
    };
  } catch (err) {
    console.error("Google Sign-in error:", err);
    throw err;
  }
};
