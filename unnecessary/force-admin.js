import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-credentials.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/'
});

const db = admin.database();
const auth = admin.auth();
const uid = '2UArhkee4NQYh6gdT6D1HVRhSCk1';

console.log('🚀 Forcing admin privileges...');

// Update the user data directly at the correct path
await db.ref(`users/${uid}`).update({
  role: 'admin',
  isAdmin: true,
  updatedAt: new Date().toISOString()
});

// Set Firebase custom claims
await auth.setCustomUserClaims(uid, { admin: true });

console.log('✅ Admin privileges updated!');

// Verify the changes
const snapshot = await db.ref(`users/${uid}`).once('value');
const userData = snapshot.val();
console.log('\n📋 Updated user data:');
console.log(`Role: ${userData.role}`);
console.log(`isAdmin: ${userData.isAdmin}`);
console.log(`Email: ${userData.email}`);

// Check custom claims
const userRecord = await auth.getUser(uid);
console.log(`Custom claims admin: ${userRecord.customClaims?.admin}`);

console.log('\n🎉 ADMIN ACCESS GRANTED!');
console.log('📝 Please log out and log back in to refresh your session.');

process.exit(0);
