import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAX2Ajv0v39rbiAmNkep3wW7nIEXNDRpXk",
  authDomain: "the-planning-bee.firebaseapp.com",
  projectId: "the-planning-bee",
  storageBucket: "the-planning-bee.firebasestorage.app",
  messagingSenderId: "187855030814",
  appId: "1:187855030814:web:d652857ee5598f8fa4bc0f",
  measurementId: "G-2FL8NJ4DZE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db };
