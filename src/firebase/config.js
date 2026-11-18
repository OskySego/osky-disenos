import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUM-WE-SmK8xyNOk8x35zP4h5lbGqZYts",
  authDomain: "osky-disenos.firebaseapp.com",
  projectId: "osky-disenos",
  storageBucket: "osky-disenos.firebasestorage.app",
  messagingSenderId: "871487806449",
  appId: "1:871487806449:web:87740b663dd33679f20250"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);