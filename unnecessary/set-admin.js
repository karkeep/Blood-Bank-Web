// Script to set a specific user as a superadmin
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update, get } from 'firebase/database';

// Firebase configuration copied from your project
const firebaseConfig = {
  apiKey: "AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8",
  authDomain: "blood-bank-f759d.firebaseapp.com",
  projectId: "blood-bank-f759d",
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "blood-bank-f759d.appspot.com",
  messagingSenderId: "131654509538",
  appId: "1:131654509538:web:8724207409d99bc5f64fbb",
  measurementId: "G-70VEL4M8K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// User ID to make admin
const userId = '2UArhkee4NQYh6gdT6D1HVRhSCk1';

// Function to update user to admin
async function setUserAsAdmin(uid) {
  try {
    console.log(`Setting user ${uid} as admin...`);
    
    // Find the user in the 'users' collection by firebaseUid
    const userRef = ref(database, 'users');
    
    // Get all users
    const snapshot = await get(userRef);
    const users = snapshot.val();
    
    // Find user with matching firebaseUid
    let userKey = null;
    for (const key in users) {
      if (users[key].firebaseUid === uid) {
        userKey = key;
        break;
      }
    }
    
    if (!userKey) {
      console.error(`No user found with firebaseUid: ${uid}`);
      return;
    }
    
    // Update user to be admin
    const updates = {
      [`users/${userKey}/isAdmin`]: true,
      [`users/${userKey}/role`]: 'admin',
      [`users/${userKey}/updatedAt`]: new Date().toISOString()
    };
    
    await update(ref(database), updates);
    console.log(`✅ User ${uid} has been updated successfully!`);
    console.log(`User key: ${userKey}`);
    
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

// Run the function
setUserAsAdmin(userId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
