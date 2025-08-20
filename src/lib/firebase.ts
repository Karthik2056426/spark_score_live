import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your own Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBZfJwoNLYvDCuTHv4gQEEGoyEljBWMaf0',
  authDomain: 'spa-juniors.firebaseapp.com',
  projectId: 'spa-juniors',
  storageBucket: 'spa-juniors.firebasestorage.app',
  messagingSenderId: '191398693192',
  appId: '1:191398693192:web:87eee4e71c20ffd1190b7d',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 