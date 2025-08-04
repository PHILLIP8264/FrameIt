// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-wmT4AhZMPYrNIu1G69XUi_dW3xokuXI",
  authDomain: "fameit-ee617.firebaseapp.com",
  projectId: "fameit-ee617",
  storageBucket: "fameit-ee617.firebasestorage.app",
  messagingSenderId: "635352633359",
  appId: "1:635352633359:web:e8c3cef76d09371464137a",
  measurementId: "G-5551QMFE82",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional - only works in web environment)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
