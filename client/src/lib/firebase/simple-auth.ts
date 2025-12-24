// client/src/lib/firebase/simple-auth.ts
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase-config';
import { GoogleAuthProvider } from 'firebase/auth';

// Create a fresh Google provider instance
const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return provider;
};

export const simpleAuth = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      console.log('🔥 Starting Google Sign-In...');
      console.log('🔐 Auth instance:', auth);
      console.log('🔐 Auth config:', auth.config);
      
      const provider = createGoogleProvider();
      console.log('🔐 Provider created:', provider);
      
      // Check if we're in the right domain
      console.log('🌐 Current domain:', window.location.hostname);
      console.log('🌐 Current protocol:', window.location.protocol);
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful!', result.user);
      
      return {
        success: true,
        user: result.user,
        message: `Welcome ${result.user.displayName || result.user.email}!`
      };
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error);
      
      let message = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized. Please contact support.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled. Please contact support.';
      }
      
      return {
        success: false,
        error: error.code,
        message
      };
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true, message: 'Signed out successfully' };
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      return { success: false, message: 'Sign out failed' };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
