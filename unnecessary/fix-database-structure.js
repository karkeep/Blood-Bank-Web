// Fix the database structure by moving user data to the correct path
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to service account file
const serviceAccountPath = join(__dirname, 'firebase-credentials.json');

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

async function fixDatabaseStructure() {
  const db = admin.database();

  try {
    console.log('🔄 Starting database structure fix...');
    
    // Get all users from the current structure
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    
    console.log(`📋 Found ${Object.keys(users).length} users in database`);
    
    for (const userKey in users) {
      const userData = users[userKey];
      
      if (userData.firebaseUid) {
        console.log(`🔧 Processing user: ${userData.username || userData.email}`);
        console.log(`   Moving from users/${userKey} to users/${userData.firebaseUid}`);
        
        // Set user data at the correct path (using firebaseUid as key)
        await db.ref(`users/${userData.firebaseUid}`).set({
          ...userData,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ User data moved successfully for ${userData.username || userData.email}`);
        
        // Remove old data (optional - comment out if you want to keep backup)
        // await db.ref(`users/${userKey}`).remove();
        // console.log(`🗑️  Removed old data at users/${userKey}`);
      } else {
        console.log(`⚠️  User at ${userKey} has no firebaseUid, skipping...`);
      }
    }
    
    console.log('🎉 Database structure fix completed!');
    console.log('💡 Users can now log out and log back in to access admin features.');
    
  } catch (error) {
    console.error('❌ Error fixing database structure:', error);
  }
}

fixDatabaseStructure();
