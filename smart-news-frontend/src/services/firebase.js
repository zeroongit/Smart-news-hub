import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC3ukcyK_GaBj4ilK_HzrtHUpngUmOURB8",
  authDomain: "portofolio-1bd50.firebaseapp.com",
  databaseURL: "https://portofolio-1bd50-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portofolio-1bd50",
  storageBucket: "portofolio-1bd50.firebasestorage.app",
  messagingSenderId: "349365012344",
  appId: "1:349365012344:web:b634fe130ff9587a206a8d",
  measurementId: "G-04VVHSD610"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
