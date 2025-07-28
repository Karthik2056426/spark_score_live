import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your own Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyD5ywoPmu3eKHJz7YCOPZXWJB8FoV3IMmY',
  authDomain: 'spa-scores-spark.firebaseapp.com',
  projectId: 'spa-scores-spark',
  storageBucket: 'spa-scores-spark.appspot.com',
  messagingSenderId: '1016059668517',
  appId: '1:1016059668517:web:0f21514aa60238ed43b7cc',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 