// Import the functions you need from the SDKs you need
import { GoogleAuthProvider } from "firebase/auth";
import { app, auth, database, storage } from '../firebase-config';

// Configure Google provider with additional scopes and options
const googleProvider = new GoogleAuthProvider();
// Add scopes for additional Google permissions if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Set custom parameters (optional)
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection even when one account is available
});

export { auth, database, storage, googleProvider };
export default app;