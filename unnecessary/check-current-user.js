import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-credentials.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/'
});

const db = admin.database();
const uid = '2UArhkee4NQYh6gdT6D1HVRhSCk1';

console.log(`Checking user data for UID: ${uid}`);
const snapshot = await db.ref(`users/${uid}`).once('value');
const userData = snapshot.val();

if (userData) {
  console.log('\n✅ User data found:');
  console.log(JSON.stringify(userData, null, 2));
} else {
  console.log('\n❌ No user data found at this path');
  console.log('Checking all users...');
  const allUsers = await db.ref('users').once('value');
  const users = allUsers.val() || {};
  for (const [key, user] of Object.entries(users)) {
    if (user.firebaseUid === uid || user.email === 'karkeep@gmail.com') {
      console.log(`Found user data at key: ${key}`);
      console.log(JSON.stringify(user, null, 2));
    }
  }
}

process.exit(0);
