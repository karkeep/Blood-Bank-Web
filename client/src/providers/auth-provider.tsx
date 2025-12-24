import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { authService } from '@/lib/firebase/auth';
import { dbService, UserSchema, DonorProfileSchema } from '@/lib/firebase/database';

// Define auth context type
interface AuthContextType {
  user: UserSchema | null;
  authUser: User | null;
  donorProfile: DonorProfileSchema | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserSchema>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<UserSchema>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<UserSchema>) => Promise<UserSchema>;
  updateDonorProfile: (userId: string, profileData: Partial<DonorProfileSchema>) => Promise<DonorProfileSchema>;
  updateDonorLocation: (userId: string, latitude: number, longitude: number) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSchema | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfileSchema | null>(null);
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
            
            // If user is a donor, get donor profile
            if (userRecord && userRecord.role === 'donor') {
              const profile = await dbService.getDonorProfile(userRecord.id);
              setDonorProfile(profile);
            }
          }
        } else {
          // User is signed out
          setAuthUser(null);
          setUser(null);
          setDonorProfile(null);
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

  // Sign in function
  const signIn = async (email: string, password: string): Promise<UserSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      const userRecord = await authService.signIn(email, password);
      setUser(userRecord);
      
      // If user is a donor, get donor profile
      if (userRecord.role === 'donor') {
        const profile = await dbService.getDonorProfile(userRecord.id);
        setDonorProfile(profile);
      }
      
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
      setDonorProfile(null);
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
      
      // If user is a donor, get donor profile
      if (newUser.role === 'donor') {
        const profile = await dbService.getDonorProfile(newUser.id);
        setDonorProfile(profile);
      }
      
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

  // Update donor profile function
  const updateDonorProfile = async (
    userId: string, 
    profileData: Partial<DonorProfileSchema>
  ): Promise<DonorProfileSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current donor profile
      const currentProfile = await dbService.getDonorProfile(userId);
      
      if (!currentProfile) {
        throw new Error('Donor profile not found');
      }
      
      // Update donor profile
      await dbService.update('donorProfiles', currentProfile.id, profileData);
      
      // Get updated profile
      const updatedProfile = await dbService.getDonorProfile(userId);
      
      if (!updatedProfile) {
        throw new Error('Failed to retrieve updated donor profile');
      }
      
      setDonorProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update donor profile. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update donor location
  const updateDonorLocation = async (
    userId: string, 
    latitude: number, 
    longitude: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await dbService.updateDonorLocation(userId, latitude, longitude);
      
      // Update user and donor profile state
      if (user) {
        const updatedUser = { 
          ...user, 
          location: { 
            ...user.location, 
            latitude, 
            longitude 
          } 
        };
        setUser(updatedUser);
      }
      
      if (donorProfile) {
        const updatedProfile = { 
          ...donorProfile, 
          latitude, 
          longitude 
        };
        setDonorProfile(updatedProfile);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update location. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create context value
  const value = {
    user,
    authUser,
    donorProfile,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateProfile,
    updateDonorProfile,
    updateDonorLocation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
