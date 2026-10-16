import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDiqMzCFRe96ZCYhpderXQNi5AWvX1HaFk",
  authDomain: "road-hazard-detection-ff1b3.firebaseapp.com",
  databaseURL: "https://road-hazard-detection-ff1b3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "road-hazard-detection-ff1b3",
  storageBucket: "road-hazard-detection-ff1b3.firebasestorage.app",
  messagingSenderId: "506543630194",
  appId: "1:506543630194:web:2ce18a1529a558219f9feb",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);