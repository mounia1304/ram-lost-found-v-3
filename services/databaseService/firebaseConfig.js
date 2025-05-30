import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAhD6i-ktlJpP4bgmKFKk6sNLYezhM4_tY",
  authDomain: "ram-lost-and-found.firebaseapp.com",
  projectId: "ram-lost-and-found",
  storageBucket: "ram-lost-and-found.firebasestorage.app",
  messagingSenderId: "131706129314",
  appId: "1:131706129314:web:5cbe6f8bcc71939f7740fb",
};
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize other services
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, firestore, storage, functions };
