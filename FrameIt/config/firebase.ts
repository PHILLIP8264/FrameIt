// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2e-FVDgEA85QuVxKux6CHG7Jqm5Yh48k",
  authDomain: "frameit-e6e16.firebaseapp.com",
  projectId: "frameit-e6e16",
  storageBucket: "frameit-e6e16.firebasestorage.app",
  messagingSenderId: "459361826040",
  appId: "1:459361826040:web:b572dcbd12c30744f9b70d",
  measurementId: "G-RQNSBEJLG6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, "frameit-data");
export const storage = getStorage(app);

export default app;
