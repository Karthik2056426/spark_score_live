// Usage: node scripts/migrate-fix-event-names.js
// This script updates all events in Firestore that are missing a name or have an empty name.

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function fixEventNames() {
  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      await doc.ref.update({ name: '[No Name]' });
      console.log(`Updated event ${doc.id} to have name '[No Name]'`);
      updated++;
    }
  }
  console.log(`Migration complete. Updated ${updated} events.`);
}

fixEventNames().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 