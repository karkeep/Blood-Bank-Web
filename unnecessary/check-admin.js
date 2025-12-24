// Simple script to directly check and update admin status in Firebase
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Email to check
const EMAIL = 'karkeep@gmail.com';

// Path to service account file
const serviceAccountPath = join(__dirname, 'firebase-credentials.json');

// Check if the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: Service account file (firebase-credentials.json) not found.");
  process.exit(1);
}

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

async function checkAdminStatus() {
  const db = admin.database();
  const auth = admin.auth();

  try {
    // Try to get the user from Firebase Auth
    console.log(`Looking up user with email: ${EMAIL}`);
    const userRecord = await auth.getUserByEmail(EMAIL);
    console.log(`Found user with UID: ${userRecord.uid}`);

    // Get the custom claims
    const customClaims = userRecord.customClaims || {};
    console.log('Current custom claims:', customClaims);

    // Check Firebase database for this user
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    let dbUser = null;
    let userKey = null;
    
    // Find user by firebaseUid or email
    for (const key in users) {
      const user = users[key];
      if (user.firebaseUid === userRecord.uid || user.email === EMAIL) {
        dbUser = user;
        userKey = key;
        break;
      }
    }

    if (dbUser) {
      console.log('Found user in database:', dbUser);
      console.log('User key:', userKey);
      console.log('Current admin status in DB:', dbUser.isAdmin);
      console.log('Current role in DB:', dbUser.role);
      
      // Update user to be admin if not already
      if (!dbUser.isAdmin || dbUser.role !== 'admin') {
        console.log('Updating user to be admin...');
        await db.ref(`users/${userKey}`).update({
          isAdmin: true,
          role: 'admin',
          updatedAt: new Date().toISOString()
        });
        console.log('User updated in database!');
      }
    } else {
      console.log('User not found in database. Creating new admin user...');
      const newUserRef = db.ref('users').push();
      await newUserRef.set({
        username: EMAIL.split('@')[0],
        email: EMAIL,
        bloodType: "O+",
        role: "admin",
        isAdmin: true,
        firebaseUid: userRecord.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Created new admin user with key:', newUserRef.key);
    }
    
    // Update custom claims if needed
    if (!customClaims.admin) {
      console.log('Setting admin custom claim...');
      await auth.setCustomUserClaims(userRecord.uid, { admin: true });
      console.log('Custom claims updated!');
    }
    
    console.log('\nVerification completed:');
    console.log('1. Firebase Auth UID:', userRecord.uid);
    console.log('2. Custom Claims admin:', true);
    console.log('3. Database isAdmin:', true);
    console.log('4. Database role:', 'admin');
    console.log('\nPlease sign out and sign back in to refresh your session.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminStatus();
