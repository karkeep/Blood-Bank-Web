import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  getIdToken
} from "firebase/auth";
import { auth, database } from "../lib/firebase/api";
import { GoogleAuthProvider } from "firebase/auth";

// Create Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
import { useToast } from "@/hooks/use-toast";
// Remove ENV import as it's not needed with Firebase config in api.ts
import { ref, get, set } from "firebase/database";

// Define a User type if shared/schema is not available
type User = {
  id: string | number;
  username: string;
  email: string;
  bloodType: string;
  role: string;
  isAdmin?: boolean;
  firebaseUid?: string;
  fullName?: string;
};

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string, bloodType: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast() || { toast: (props: any) => console.log('Toast:', props) };
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // Try to fetch user data from Firebase Realtime Database
          const userRef = ref(database, `users/${fbUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const user: User = {
              id: fbUser.uid,
              username: userData.username || fbUser.email?.split('@')[0] || 'user',
              email: userData.email || fbUser.email || 'user@example.com',
              bloodType: userData.bloodType || "O+",
              role: userData.role || "donor",
              firebaseUid: fbUser.uid,
              fullName: userData.fullName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              isAdmin: userData.isAdmin === true || userData.role === 'admin' || userData.role === 'superadmin'
            };
            setUser(user);
            console.log("✅ User data loaded from database:", user);
          } else {
            // If user doesn't exist in database, create default user data
            const defaultUser: User = {
              id: fbUser.uid,
              username: fbUser.email?.split('@')[0] || 'user',
              email: fbUser.email || 'user@example.com',
              bloodType: "O+",
              role: "donor",
              firebaseUid: fbUser.uid,
              fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              isAdmin: false
            };
            
            // Save to database for future use
            const userRef = ref(database, `users/${fbUser.uid}`);
            await set(userRef, {
              ...defaultUser,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            setUser(defaultUser);
            console.log("✅ Created new user in database:", defaultUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to basic user data if database fetch fails
          const fallbackUser: User = {
            id: fbUser.uid,
            username: fbUser.email?.split('@')[0] || 'user',
            email: fbUser.email || 'user@example.com',
            bloodType: "O+",
            role: "donor",
            firebaseUid: fbUser.uid,
            fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            isAdmin: false
          };
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const refreshToken = async () => {
    try {
      setIsLoading(true);
      if (!firebaseUser) {
        throw new Error("No user logged in");
      }
      
      // Force token refresh
      await getIdToken(firebaseUser, true);
      
      return firebaseUser.getIdTokenResult();
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      
      if (toast) {
        toast({
          title: "Login successful",
          description: "Welcome back to Jiwandan!",
        });
      }
    } catch (error) {
      setError(error as Error);
      if (toast) {
        toast({
          title: "Login failed",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔥 Starting Google Sign-In...");
      console.log("📱 Auth instance:", auth);
      console.log("🔑 Provider:", googleProvider);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log("✅ Google sign-in successful!");
      console.log("👤 User:", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      
      if (toast) {
        toast({
          title: "Google login successful",
          description: "Welcome to Jiwandan!",
        });
      }
      
      // The user data will be handled by onAuthStateChanged
      
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      console.error("📍 Error code:", error.code);
      console.error("💬 Error message:", error.message);
      
      setError(error as Error);
      
      // Provide helpful error messages
      let userMessage = "Failed to sign in with Google.";
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          userMessage = "Sign-in cancelled. Please try again.";
          break;
        case 'auth/popup-blocked':
          userMessage = "Popup was blocked. Please allow popups and try again.";
          break;
        case 'auth/operation-not-allowed':
          userMessage = "Google sign-in is not enabled. Please contact support.";
          break;
        case 'auth/unauthorized-domain':
          userMessage = "This domain is not authorized. Please contact support.";
          break;
        case 'auth/invalid-api-key':
          userMessage = "Configuration error. Please contact support.";
          break;
      }
      
      if (toast) {
        toast({
          title: "Google login failed",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      if (toast) {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      }
    } catch (error) {
      setError(error as Error);
      if (toast) {
        toast({
          title: "Logout failed",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const refreshUser = async () => {
    // For development, just return the current user
    return user;
  };
  
  const register = async (username: string, email: string, password: string, bloodType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user data with default donor role
      const userData: User = {
        id: userCredential.user.uid,
        username,
        email,
        bloodType,
        role: "donor", // New users start as donors
        firebaseUid: userCredential.user.uid,
        fullName: username,
        isAdmin: false
      };
      
      // Save user data to Firebase Realtime Database
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setUser(userData);
      console.log("✅ User registered and saved to database:", userData);
      
      if (toast) {
        toast({
          title: "Registration successful",
          description: "Welcome to Jiwandan! Your account has been created.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error as Error);
      
      if (toast) {
        toast({
          title: "Registration failed",
          description: (error as Error).message || "An unknown error occurred",
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        error,
        initialized,
        loginWithEmailPassword,
        loginWithGoogle,
        logout,
        register,
        refreshToken,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Provide a default context that won't break if used outside AuthProvider
    return {
      user: null,
      firebaseUser: null,
      isLoading: false,
      error: null,
      initialized: true,
      loginWithEmailPassword: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      loginWithGoogle: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      logout: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      register: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      refreshToken: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      refreshUser: async () => { throw new Error("useAuth must be used within an AuthProvider"); }
    } as AuthContextType;
  }
  return context;
}