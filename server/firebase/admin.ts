import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory for ESM compatibility
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Firebase Auth for development
const mockAuth = {
  verifyIdToken: async (token: string) => {
    // In development mode, we'll accept any token and return mock user data
    return {
      uid: "mock-uid-123",
      email: "user@example.com",
      name: "Mock User",
      picture: "https://placekitten.com/100/100"
    };
  }
};

// Initialize Firebase Admin SDK if needed
let auth: typeof admin.auth;
let isUsingMockAuth = false;

// Check if we should use mock Firebase
const useMockFirebase = process.env.USE_MOCK_FIREBASE === 'true';

if (useMockFirebase) {
  console.log("Using mock Firebase auth for development");
  auth = mockAuth as any;
  isUsingMockAuth = true;
} else if (!admin.apps.length) {
  try {
    // Default project ID
    const projectId = process.env.FIREBASE_PROJECT_ID || "blood-bank-f759d";
    const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/";
    
    console.log("Initializing Firebase Admin SDK with projectId:", projectId);
    
    // Check for service account file in project root
    const serviceAccountPath = path.join(process.cwd(), 'firebase-credentials.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log("Using Firebase service account from file:", serviceAccountPath);
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
      });
      
      console.log("Firebase Admin SDK initialized successfully from credentials file");
    } else {
      console.error("No Firebase service account found at", serviceAccountPath);
      console.log("Falling back to mock Firebase auth");
      auth = mockAuth as any;
      isUsingMockAuth = true;
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    console.log("Falling back to mock Firebase auth");
    auth = mockAuth as any;
    isUsingMockAuth = true;
  }
} else {
  auth = admin.auth();
}

export { auth, isUsingMockAuth };
export default admin;