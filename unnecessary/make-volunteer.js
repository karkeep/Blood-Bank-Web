#!/usr/bin/env node

/**
 * Script to create a volunteer account in Firebase
 * Run this script using: node make-volunteer.js email@example.com
 */

const fs = require('fs');
const path = require('path');

// Check for Firebase credentials file
const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
if (!fs.existsSync(credentialsPath)) {
  console.error('Error: firebase-credentials.json not found!');
  console.error('Please ensure you have a valid Firebase credentials file before running this script.');
  process.exit(1);
}

const admin = require('firebase-admin');
let serviceAccount;

try {
  serviceAccount = require(credentialsPath);
} catch (error) {
  console.error('Error reading firebase-credentials.json:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address: node make-volunteer.js email@example.com');
  process.exit(1);
}

async function makeVolunteer() {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      volunteer: true
    });
    
    console.log(`Successfully set volunteer privileges for ${email} (${user.uid})`);
    
    // Also update user in Firebase Realtime Database
    const db = admin.database();
    const usersRef = db.ref('users');
    
    // Find user by firebaseUid
    const snapshot = await usersRef.orderByChild('firebaseUid').equalTo(user.uid).once('value');
    const users = snapshot.val();
    
    if (users) {
      const userId = Object.keys(users)[0];
      
      // Update user role
      await usersRef.child(userId).update({
        role: 'volunteer',
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Updated user record in database with volunteer role`);
    } else {
      console.log(`Warning: No matching user found in database for ${email}`);
    }
  } catch (error) {
    console.error('Error making volunteer:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

makeVolunteer();