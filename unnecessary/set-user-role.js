// set-user-role.js
// Script to set user roles in Firebase Realtime Database
// Usage: node set-user-role.js <email> <role>
// Example: node set-user-role.js admin@example.com admin

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-project.firebaseio.com"
});

const db = admin.database();
const auth = admin.auth();

async function setUserRole(email, role) {
  try {
    // Valid roles
    const validRoles = ['superadmin', 'admin', 'moderator', 'volunteer', 'donor', 'user'];
    
    if (!validRoles.includes(role)) {
      console.error(`❌ Invalid role: ${role}`);
      console.log(`Valid roles are: ${validRoles.join(', ')}`);
      process.exit(1);
    }
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.email} (UID: ${userRecord.uid})`);
    
    // Update user role in database
    const userRef = db.ref(`users/${userRecord.uid}`);
    
    // Get existing user data
    const snapshot = await userRef.once('value');
    const existingData = snapshot.val() || {};
    
    // Update with new role
    await userRef.update({
      ...existingData,
      email: userRecord.email,
      role: role,
      isAdmin: role === 'admin' || role === 'superadmin',
      updatedAt: new Date().toISOString(),
      updatedBy: 'set-user-role-script'
    });
    
    console.log(`✅ Successfully set role '${role}' for user ${email}`);
    
    // Also set custom claims for additional security
    await auth.setCustomUserClaims(userRecord.uid, { 
      role: role,
      isAdmin: role === 'admin' || role === 'superadmin'
    });
    
    console.log(`✅ Custom claims updated for enhanced security`);
    console.log(`\n📝 Note: The user may need to sign out and sign back in for changes to take effect.`);
    
  } catch (error) {
    console.error('❌ Error setting user role:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node set-user-role.js <email> <role>');
  console.log('Example: node set-user-role.js admin@example.com admin');
  console.log('\nValid roles: superadmin, admin, moderator, volunteer, donor, user');
  process.exit(1);
}

const [email, role] = args;
setUserRole(email, role);
