import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../firebase-config';

// Create Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export class AuthService {
  // Initialize auth state listener
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Sign in with Google using popup
  static async signInWithGooglePopup(): Promise<User> {
    try {
      console.log('🔥 Starting Google Sign-In with Popup...');
      console.log('Auth object:', auth);
      console.log('Provider object:', googleProvider);
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google Sign-In Success:', result.user);
      return result.user;
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-blocked') {
        console.log('🔄 Popup blocked, trying redirect...');
        return await this.signInWithGoogleRedirect();
      }
      
      throw error;
    }
  }

  // Sign in with Google using redirect (fallback)
  static async signInWithGoogleRedirect(): Promise<User> {
    try {
      console.log('🔄 Starting Google Sign-In with Redirect...');
      await signInWithRedirect(auth, googleProvider);
      
      // This will be handled by getRedirectResult in the app initialization
      throw new Error('Redirect initiated - check result on page load');
    } catch (error) {
      console.error('❌ Google Redirect Error:', error);
      throw error;
    }
  }

  // Handle redirect result (call this on app initialization)
  static async handleRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        console.log('✅ Google Redirect Success:', result.user);
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('❌ Redirect Result Error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Get error message for user display
  static getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup blocked. Please allow popups and try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in cancelled. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled. Please contact support.';
      default:
        return error.message || 'An error occurred during sign-in.';
    }
  }
}
