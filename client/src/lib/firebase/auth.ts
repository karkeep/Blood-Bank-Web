import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { dbService, UserSchema, DB_PATHS } from './database';

export interface AuthError {
  code: string;
  message: string;
}

// Type for the user registration data
export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  role: "donor" | "requester" | "admin";
  phoneNumber?: string;
  fullName?: string;
}

export const authService = {
  // Register a new user
  registerUser: async (userData: UserRegistrationData): Promise<UserSchema> => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Set display name
      await updateProfile(user, {
        displayName: userData.username
      });
      
      // Create user in Realtime Database
      const userForDb: Omit<UserSchema, 'id'> = {
        uid: user.uid,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName,
        bloodType: userData.bloodType,
        role: userData.role,
        isAdmin: userData.role === 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const userId = await dbService.create<Omit<UserSchema, 'id'>>(DB_PATHS.USERS, userForDb);
      
      // If user is a donor, create donor profile
      if (userData.role === 'donor') {
        await dbService.create(DB_PATHS.DONOR_PROFILES, {
          userId,
          status: 'Pending',
          badge: 'Bronze',
          totalDonations: 0,
          litersDonated: 0,
          livesSaved: 0,
          verificationStatus: 'Unverified',
          isVisible: true
        });
      }
      
      // Get the complete user record
      const newUser = await dbService.get<UserSchema>(DB_PATHS.USERS, userId);
      if (!newUser) throw new Error('User created but could not be retrieved');
      
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  // Sign in with Google
  signInWithGoogle: async (): Promise<UserSchema> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists in database
      let userRecord = await dbService.getUserByEmail(user.email || '');
      
      if (!userRecord) {
        // Create new user record for Google sign-in
        const userForDb: Omit<UserSchema, 'id'> = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          phoneNumber: user.phoneNumber || undefined,
          fullName: user.displayName || undefined,
          bloodType: 'O+', // Default, user can update later
          role: 'donor', // Default role
          isAdmin: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        const userId = await dbService.create<Omit<UserSchema, 'id'>>(DB_PATHS.USERS, userForDb);
        
        // Create default donor profile
        await dbService.create(DB_PATHS.DONOR_PROFILES, {
          userId,
          status: 'Pending',
          badge: 'Bronze',
          totalDonations: 0,
          litersDonated: 0,
          livesSaved: 0,
          verificationStatus: 'Unverified',
          isVisible: true
        });
        
        userRecord = await dbService.get<UserSchema>(DB_PATHS.USERS, userId);
      }
      
      if (!userRecord) throw new Error('Failed to create or retrieve user record');
      
      return userRecord;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },
  
  // Sign in a user
  signIn: async (email: string, password: string): Promise<UserSchema> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from the database
      const userRecord = await dbService.getUserByEmail(email);
      if (!userRecord) throw new Error('User not found in database');
      
      return userRecord;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userId: string, profileData: Partial<UserSchema>): Promise<UserSchema> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Update display name if provided
      if (profileData.username) {
        await updateProfile(user, {
          displayName: profileData.username
        });
      }
      
      // Update user in database
      await dbService.update<UserSchema>(DB_PATHS.USERS, userId, {
        ...profileData,
        updatedAt: Date.now()
      });
      
      // Get updated user record
      const updatedUser = await dbService.get<UserSchema>(DB_PATHS.USERS, userId);
      if (!updatedUser) throw new Error('User not found after update');
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  // Update email
  updateEmail: async (userId: string, newEmail: string, password: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Reauthenticate user before updating email
      const credential = EmailAuthProvider.credential(user.email || '', password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email in authentication
      await updateEmail(user, newEmail);
      
      // Update email in database
      await dbService.update<UserSchema>(DB_PATHS.USERS, userId, {
        email: newEmail,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  },
  
  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      // Reauthenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },
  
  // Get current user with full profile from database
  getCurrentUserWithProfile: async (): Promise<UserSchema | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const userRecord = await dbService.getUserByEmail(user.email || '');
      return userRecord;
    } catch (error) {
      console.error('Error getting current user profile:', error);
      throw error;
    }
  }
};
