// ES Module version of the admin script
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase User ID to make admin
const FIREBASE_UID = '2UArhkee4NQYh6gdT6D1HVRhSCk1';

// Path to service account file
const serviceAccountPath = join(__dirname, 'firebase-credentials.json');

// Check if the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: Service account file (firebase-credentials.json) not found.");
  console.error("Please place your Firebase service account JSON file in the project root directory.");
  process.exit(1);
}

// Load service account (ES module can't use require for JSON)
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

// Database reference
const db = admin.database();

async function makeUserAdmin() {
  try {
    console.log(`\nStarting process to make user ${FIREBASE_UID} a superadmin...`);
    
    // First find the user in the 'users' collection by firebaseUid field
    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');
    const usersData = snapshot.val();
    
    let userRecord = null;
    let userKey = null;
    
    // Find user with matching firebaseUid
    for (const key in usersData) {
      if (usersData[key].firebaseUid === FIREBASE_UID) {
        userRecord = usersData[key];
        userKey = key;
        break;
      }
    }
    
    if (!userKey) {
      console.log(`\n❌ No user found with Firebase UID: ${FIREBASE_UID}`);
      console.log('\nCreating a new admin user record...');
      
      // Create a new user if not found
      const newUserRef = usersRef.push();
      const newUser = {
        username: "admin_superuser",
        email: "admin@example.com", // This would typically be fetched from Firebase Auth
        bloodType: "O+",
        role: "admin",
        isAdmin: true,
        firebaseUid: FIREBASE_UID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await newUserRef.set(newUser);
      console.log(`\n✅ Created new admin user with key: ${newUserRef.key}`);
      userKey = newUserRef.key;
    } else {
      console.log(`\n✓ Found existing user: ${userRecord.username} (${userRecord.email})`);
      
      // Update the existing user to be an admin
      await usersRef.child(userKey).update({
        isAdmin: true,
        role: 'admin',
        updatedAt: new Date().toISOString()
      });
      
      console.log(`\n✅ Updated user to superadmin status!`);
    }
    
    // Double check to make sure the update worked
    const updatedSnapshot = await usersRef.child(userKey).once('value');
    const updatedUser = updatedSnapshot.val();
    
    console.log('\n✓ Verification:');
    console.log(`  - User ID: ${userKey}`);
    console.log(`  - Firebase UID: ${updatedUser.firebaseUid}`);
    console.log(`  - Username: ${updatedUser.username}`);
    console.log(`  - Role: ${updatedUser.role}`);
    console.log(`  - Admin Status: ${updatedUser.isAdmin ? 'Yes' : 'No'}`);
    
    console.log('\n🎉 Process completed successfully!');
  } catch (error) {
    console.error('\n❌ Error updating user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
makeUserAdmin();
