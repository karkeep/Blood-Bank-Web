// check-google-auth.js
// Quick script to check if Google Auth is properly configured
const admin = require('firebase-admin');

console.log("🔍 Checking Google Authentication Configuration...\n");

// Check if service account exists
try {
  const serviceAccount = require('./firebase-credentials.json');
  console.log("✅ Firebase service account found");
  console.log(`📋 Project ID: ${serviceAccount.project_id}`);
} catch (error) {
  console.error("❌ Firebase service account not found!");
  console.log("   Please ensure firebase-credentials.json exists");
  process.exit(1);
}

console.log("\n📝 Next Steps:");
console.log("1. Go to: https://console.firebase.google.com/");
console.log("2. Select your project: blood-bank-f759d");
console.log("3. Navigate to: Authentication → Sign-in method");
console.log("4. Enable 'Google' provider");
console.log("5. Add your support email");
console.log("6. Save the changes");

console.log("\n🧪 To test authentication:");
console.log("1. Open: client/simple-google-test.html in your browser");
console.log("2. Click 'Sign In with Google'");
console.log("3. If it works there but not in React app, the issue is in the React code");
console.log("4. If it doesn't work there, Google sign-in is not enabled in Firebase");

console.log("\n🔧 Common fixes:");
console.log("- Clear browser cache and cookies");
console.log("- Allow popups for localhost");
console.log("- Try incognito/private mode");
console.log("- Check browser console for specific error messages");
