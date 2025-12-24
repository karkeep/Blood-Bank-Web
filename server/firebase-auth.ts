import type { Express, Request, Response, NextFunction } from "express";
import { auth } from './firebase/admin';
import { storage } from "./storage";
import { z } from "zod";

// Add request typing for TypeScript
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: any;
    }
  }
}

// Middleware to verify Firebase token
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Option 1: In development with mock enabled
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_FIREBASE === 'true') {
      console.log("Using mock Firebase user for development");
      req.firebaseUser = {
        uid: 'test-firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
        picture: '',
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600,
        aud: 'blood-bank-f759d',
        iss: 'https://securetoken.google.com/blood-bank-f759d',
        sub: 'test-firebase-uid'
      };
      return next();
    }

    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No Authorization header found");
      return res.status(401).json({ message: "Unauthorized - No authorization header provided" });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log("Authorization header is not Bearer token");
      return res.status(401).json({ message: "Unauthorized - Invalid authorization header format" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    console.log("Verifying Firebase token");

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("Firebase token verification successful for user:", decodedToken.uid);
      req.firebaseUser = decodedToken;
      next();
    } catch (error) {
      console.error("Firebase token verification failed:", error);
      
      // Option 2: Development fallback if token verification fails but we want to proceed
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_INVALID_TOKENS === 'true') {
        console.log("WARNING: Allowing invalid token in development mode");
        
        // Try to decode the token without verification to get some user info
        try {
          // This is not secure and should never be used in production
          const tokenParts = idToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log("Extracted payload from invalid token:", payload);
            
            req.firebaseUser = {
              uid: payload.sub || payload.user_id || 'unknown',
              email: payload.email || req.body.email || 'unknown@example.com',
              name: payload.name || '',
              iat: Date.now() / 1000,
              exp: (Date.now() / 1000) + 3600
            };
            
            return next();
          }
        } catch (e) {
          console.error("Could not extract payload from token:", e);
        }
      }
      
      // Regular error response for invalid tokens
      return res.status(401).json({ 
        message: "Invalid token", 
        error: error.message || "Token verification failed" 
      });
    }
  } catch (error) {
    console.error("Error in verifyFirebaseToken middleware:", error);
    return res.status(500).json({ 
      message: "Server authentication error", 
      error: error.message || "Unknown error"
    });
  }
}

export function setupFirebaseAuth(app: Express) {
  // Endpoint to get or create user from Firebase credentials
  app.post("/api/user/firebase", verifyFirebaseToken, async (req, res) => {
    try {
      // Get Firebase user
      const { uid, email } = req.firebaseUser;
      
      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        // If no user is found, check if the email exists
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update user with Firebase UID
          user = await storage.updateUser(user.id, { firebaseUid: uid });
        } else {
          // No user found, return 404 so client can redirect to complete profile
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      // Return user data
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user from Firebase credentials:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Endpoint to handle Google authentication
  app.post("/api/user/google-auth", verifyFirebaseToken, async (req, res) => {
    try {
      console.log("Google auth request received");
      console.log("Firebase user:", req.firebaseUser);
      console.log("Request body:", req.body);
      
      // Extract user info from Firebase auth data and request body
      // Set defaults if some data is missing
      const uid = req.firebaseUser?.uid || 'unknown-uid';
      const email = req.firebaseUser?.email || req.body.email;
      const displayName = req.firebaseUser?.name || req.body.displayName || email?.split('@')[0];
      const photoURL = req.firebaseUser?.picture || req.body.photoURL;
      const bloodType = req.body.bloodType || 'O+'; // Default blood type
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      console.log("Processing user with email:", email);
      
      // Check if user already exists by Firebase UID
      let user = null;
      
      if (uid !== 'unknown-uid') {
        user = await storage.getUserByFirebaseUid(uid);
        console.log("User found by Firebase UID:", user ? "Yes" : "No");
      }
      
      if (!user) {
        // Check if user exists by email
        user = await storage.getUserByEmail(email);
        console.log("User found by email:", user ? "Yes" : "No");
        
        if (user) {
          // Update existing user with Firebase UID
          console.log("Updating existing user with Firebase UID:", uid);
          user = await storage.updateUser(user.id, { firebaseUid: uid });
        } else {
          // Create new user
          console.log("Creating new user with email:", email);
          
          // Generate a unique username from email
          const baseUsername = email.split('@')[0];
          let username = baseUsername;
          let counter = 1;
          
          // Check if username exists, and if so, add a number to make it unique
          while (await storage.getUserByUsername(username)) {
            username = `${baseUsername}${counter}`;
            counter++;
          }
          
          try {
            // Create new user
            user = await storage.createUser({
              username,
              email,
              firebaseUid: uid,
              bloodType,
              fullName: displayName || username,
              password: '', // Not used with OAuth
              role: 'donor' // Default role
            });
            
            console.log("New user created:", user.id);
            
            // Also create donor profile
            await storage.createDonorProfile({
              userId: user.id,
              status: 'Pending',
              badge: 'Bronze',
              totalDonations: 0,
              litersDonated: 0,
              livesSaved: 0,
              verificationStatus: 'Unverified'
            });
            
            console.log("Donor profile created for user:", user.id);
          } catch (createError) {
            console.error("Error creating user:", createError);
            return res.status(500).json({ 
              message: "Failed to create user account", 
              error: createError.message || "Database error" 
            });
          }
        }
      }
      
      // Return user data
      if (!user) {
        return res.status(500).json({ message: "Failed to create or retrieve user" });
      }
      
      // Don't return password to client
      const { password, ...userWithoutPassword } = user;
      console.log("Returning user data:", userWithoutPassword);
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error handling Google authentication:", error);
      return res.status(500).json({ 
        message: "Server error during Google authentication", 
        error: error.message || "Unknown error" 
      });
    }
  });
  
  // Update Firebase registration endpoint
  app.post("/api/register", verifyFirebaseToken, async (req, res) => {
    try {
      console.log("Registration request received with Firebase user:", req.firebaseUser);
      
      const { uid, email } = req.firebaseUser;
      const { username, bloodType } = req.body;
      
      // Validate required fields
      if (!username || !bloodType) {
        return res.status(400).json({ message: "Username and blood type are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      console.log("Creating new user with Firebase UID and provided details");
      
      // Create new user with Firebase UID
      const newUser = await storage.createUser({
        username,
        email,
        firebaseUid: uid,
        bloodType,
        password: '', // Not used with OAuth
        role: 'donor' // Default role
      });
      
      console.log("New user created:", newUser.id);
      
      // Also create donor profile
      const donorProfile = await storage.createDonorProfile({
        userId: newUser.id,
        status: 'Pending',
        badge: 'Bronze',
        totalDonations: 0,
        litersDonated: 0,
        livesSaved: 0,
        verificationStatus: 'Unverified'
      });
      
      console.log("Donor profile created:", donorProfile.id);
      
      // Return user data
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Server error: " + (error.message || "Unknown error") });
    }
  });
  
  // Add a donor data API that doesn't require authentication
  app.get("/api/mock-donors", async (req, res) => {
    try {
      // Create some mock donors for the frontend to use when not authenticated
      const mockDonors = [
        {
          id: 1,
          username: "donor1",
          bloodType: "O-",
          role: "donor",
          latitude: 27.7172,
          longitude: 85.3240,
          distance: 1.2,
          status: "Available",
          donorProfile: {
            badge: "Gold",
            totalDonations: 24,
            litersDonated: 10800,
            livesSaved: 72,
            verificationStatus: "Verified"
          }
        },
        {
          id: 2,
          username: "donor2",
          bloodType: "A+",
          role: "donor",
          latitude: 27.7090,
          longitude: 85.3154,
          distance: 2.5,
          status: "Available",
          donorProfile: {
            badge: "Silver",
            totalDonations: 18,
            litersDonated: 8100,
            livesSaved: 54,
            verificationStatus: "Verified"
          }
        },
        {
          id: 3,
          username: "donor3",
          bloodType: "B+",
          role: "donor",
          latitude: 27.7134,
          longitude: 85.3102,
          distance: 3.1,
          status: "Unavailable",
          donorProfile: {
            badge: "Bronze",
            totalDonations: 7,
            litersDonated: 3150,
            livesSaved: 21,
            verificationStatus: "Verified"
          }
        },
        {
          id: 4,
          username: "donor4",
          bloodType: "AB+",
          role: "donor",
          latitude: 27.6980,
          longitude: 85.3215,
          distance: 5.4,
          status: "Available",
          donorProfile: {
            badge: "Bronze",
            totalDonations: 5,
            litersDonated: 2250,
            livesSaved: 15,
            verificationStatus: "Pending"
          }
        },
        {
          id: 5,
          username: "donor5",
          bloodType: "O+",
          role: "donor",
          latitude: 27.6880,
          longitude: 85.3401,
          distance: 7.2,
          status: "Available",
          donorProfile: {
            badge: "Gold",
            totalDonations: 32,
            litersDonated: 14400,
            livesSaved: 96,
            verificationStatus: "Verified"
          }
        },
        {
          id: 6,
          username: "donor6",
          bloodType: "A-",
          role: "donor",
          latitude: 27.7003,
          longitude: 85.3144,
          distance: 4.8,
          status: "Available",
          donorProfile: {
            badge: "Silver",
            totalDonations: 15,
            litersDonated: 6750,
            livesSaved: 45,
            verificationStatus: "Verified"
          }
        }
      ];
      
      // Filter by blood type if specified
      const bloodType = req.query.bloodType as string;
      let filteredDonors = mockDonors;
      
      if (bloodType && bloodType !== 'all') {
        filteredDonors = mockDonors.filter(donor => donor.bloodType === bloodType);
      }
      
      res.json(filteredDonors);
    } catch (error) {
      console.error("Error serving mock donors:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}