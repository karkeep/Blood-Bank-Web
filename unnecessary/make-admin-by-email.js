// ES Module version of the admin script
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Target email to make admin (your Google account)
const TARGET_EMAIL = 'karkeep@gmail.com';

// Path to service account file
const serviceAccountPath = join(__dirname, 'firebase-credentials.json');

// Check if the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: Service account file (firebase-credentials.json) not found.");
  console.error("Please place your Firebase service account JSON file in the project root directory.");
  process.exit(1);
}

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

// Get references to Auth and Database
const auth = admin.auth();
const db = admin.database();

async function makeUserAdmin() {
  try {
    console.log(`\nStarting process to make user with email ${TARGET_EMAIL} a superadmin...`);
    
    // First, find the user in Firebase Auth by email
    console.log(`\nLooking up user by email in Firebase Auth...`);
    let userRecord;
    
    try {
      userRecord = await auth.getUserByEmail(TARGET_EMAIL);
      console.log(`✓ Found user in Firebase Auth: ${userRecord.uid}`);
    } catch (error) {
      console.error(`\n❌ Error finding user by email in Firebase Auth: ${error.message}`);
      console.error(`Please make sure user with email ${TARGET_EMAIL} has signed in at least once to your application.`);
      process.exit(1);
    }
    
    // Get Firebase UID from the Auth record
    const firebaseUid = userRecord.uid;
    console.log(`Firebase UID for ${TARGET_EMAIL}: ${firebaseUid}`);
    
    // Find user in Realtime Database by Firebase UID
    const usersRef = db.ref('users');
    const snapshot = await usersRef.once('value');
    const usersData = snapshot.val() || {};
    
    let dbUserRecord = null;
    let userKey = null;
    
    // Find user with matching firebaseUid
    for (const key in usersData) {
      if (usersData[key].firebaseUid === firebaseUid || 
          usersData[key].email?.toLowerCase() === TARGET_EMAIL.toLowerCase()) {
        dbUserRecord = usersData[key];
        userKey = key;
        break;
      }
    }
    
    if (!userKey) {
      console.log(`\n❌ No user found in database matching Firebase UID: ${firebaseUid}`);
      console.log('\nCreating a new admin user record in database...');
      
      // Get display name from auth record or use email username part
      const displayName = userRecord.displayName || TARGET_EMAIL.split('@')[0];
      
      // Create a new user if not found
      const newUserRef = usersRef.push();
      const newUser = {
        username: displayName,
        email: TARGET_EMAIL,
        bloodType: "O+", // Default blood type
        role: "admin",
        isAdmin: true,
        firebaseUid: firebaseUid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await newUserRef.set(newUser);
      console.log(`\n✅ Created new admin user with key: ${newUserRef.key}`);
      userKey = newUserRef.key;
    } else {
      console.log(`\n✓ Found existing user in database: ${dbUserRecord.username || dbUserRecord.email}`);
      
      // Update the existing user to be an admin
      await usersRef.child(userKey).update({
        isAdmin: true,
        role: 'admin',
        email: TARGET_EMAIL, // Ensure email is up to date
        updatedAt: new Date().toISOString()
      });
      
      console.log(`\n✅ Updated user to superadmin status!`);
    }
    
    // Set custom claims for the user to indicate admin status
    console.log('\nSetting admin custom claim in Firebase Auth...');
    await auth.setCustomUserClaims(firebaseUid, { admin: true });
    console.log('✅ Custom claims updated successfully!');
    
    // Double check to make sure the update worked
    const updatedSnapshot = await usersRef.child(userKey).once('value');
    const updatedUser = updatedSnapshot.val();
    
    console.log('\n✓ Verification:');
    console.log(`  - User ID: ${userKey}`);
    console.log(`  - Firebase UID: ${updatedUser.firebaseUid}`);
    console.log(`  - Email: ${updatedUser.email}`);
    console.log(`  - Username: ${updatedUser.username || 'Not set'}`);
    console.log(`  - Role: ${updatedUser.role}`);
    console.log(`  - Admin Status: ${updatedUser.isAdmin ? 'Yes' : 'No'}`);
    console.log(`  - Auth Custom Claims: Admin = true`);
    
    console.log('\n🎉 Process completed successfully!');
    console.log('\n🌟 You can now login at /auth and access the admin dashboard at /admin');
  } catch (error) {
    console.error('\n❌ Error updating user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
makeUserAdmin();
