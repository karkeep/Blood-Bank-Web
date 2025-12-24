import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { authService } from '@/lib/firebase/auth';
import { dbService, UserSchema } from '@/lib/firebase/database';

// Define the return type for our hook
interface UseFirebaseAuth {
  user: UserSchema | null;
  authUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserSchema>;
  signInWithGoogle: () => Promise<UserSchema>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<UserSchema>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<UserSchema>) => Promise<UserSchema>;
}

export function useFirebaseAuth(): UseFirebaseAuth {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // User is signed in
          setAuthUser(firebaseUser);
          
          // Get user data from the database
          const userEmail = firebaseUser.email;
          if (userEmail) {
            const userRecord = await dbService.getUserByEmail(userEmail);
            setUser(userRecord);
          }
        } else {
          // User is signed out
          setAuthUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign in with Google function
  const signInWithGoogle = async (): Promise<UserSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      const userRecord = await authService.signInWithGoogle();
      setUser(userRecord);
      return userRecord;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with Google. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<UserSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      const userRecord = await authService.signIn(email, password);
      setUser(userRecord);
      return userRecord;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.signOut();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign out. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData: any): Promise<UserSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await authService.registerUser(userData);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword(email);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userId: string, profileData: Partial<UserSchema>): Promise<UserSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authService.updateUserProfile(userId, profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    authUser,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
    resetPassword,
    updateProfile
  };
}
