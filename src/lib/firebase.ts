// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLlMDWTn-k4Sk_yG9oWEW8zJ4jLUtjd1w",
  authDomain: "tatya-mitra-23tqn.firebaseapp.com",
  projectId: "tatya-mitra-23tqn",
  storageBucket: "tatya-mitra-23tqn.firebasestorage.app",
  messagingSenderId: "103934681696",
  appId: "1:103934681696:web:851a31890f873bd1895905"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };