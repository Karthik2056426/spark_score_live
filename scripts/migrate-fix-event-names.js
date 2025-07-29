// Usage: node scripts/migrate-fix-event-names.js
// This script updates all events in Firestore that are missing a name or have an empty name.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'spa-scores-spark.firebaseapp.com',
  projectId: 'spa-scores-spark',
  storageBucket: 'spa-scores-spark.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: '1:1016059668517:web:0f21514aa60238ed43b7cc'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixEventNames() {
  console.log('Starting migration...');
  
  const eventsRef = collection(db, 'events');
  const snapshot = await getDocs(eventsRef);
  let updated = 0;
  
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      await updateDoc(doc(db, 'events', docSnapshot.id), { name: '[No Name]' });
      console.log(`Updated event ${docSnapshot.id} to have name '[No Name]'`);
      updated++;
    } else {
      console.log(`Event ${docSnapshot.id} already has name: "${data.name}"`);
    }
  }
  
  console.log(`Migration complete. Updated ${updated} events.`);
}

fixEventNames().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 