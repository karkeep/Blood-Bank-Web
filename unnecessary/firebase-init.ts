// firebase-init.ts - Script to initialize Firebase Realtime Database with sample data
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory (for TypeScript ESM compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || "blood-bank-f759d";
    const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/";
    
    console.log("Initializing Firebase Admin SDK...");
    console.log(`Project ID: ${projectId}`);
    console.log(`Database URL: ${databaseURL}`);
    
    // Check for service account file
    const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log("Using Firebase service account from file:", serviceAccountPath);
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      try {
        // Check if app is already initialized
        admin.app();
        console.log("Firebase Admin SDK already initialized");
      } catch (error) {
        // Initialize app if not already initialized
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL
        });
        console.log("Firebase Admin SDK initialized successfully");
      }
      
      return true;
    } else {
      console.log("No service account file found at", serviceAccountPath);
      console.log("Please create firebase-credentials.json in the project root.");
      return false;
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    return false;
  }
}

async function initializeData() {
  try {
    // Initialize Firebase
    const firebaseInitialized = await initializeFirebase();
    if (!firebaseInitialized) {
      console.error("Failed to initialize Firebase. Migration aborted.");
      process.exit(1);
    }
    
    // Get Firebase Realtime Database reference
    const database = admin.database();
    
    console.log("Starting Firebase database initialization with sample data...");
    
    // SAMPLE DATA
    
    // Sample users
    const users = [
      {
        id: "1",
        username: "john_donor",
        email: "john@example.com",
        bloodType: "O+",
        role: "donor",
        isAdmin: false,
        password: "", // Hashed password would go here in real app
        firebaseUid: "sample-firebase-uid-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        username: "jane_requester",
        email: "jane@example.com",
        bloodType: "A-",
        role: "requester",
        isAdmin: false,
        password: "", // Hashed password would go here in real app
        firebaseUid: "sample-firebase-uid-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        username: "admin_user",
        email: "admin@example.com",
        bloodType: "AB+",
        role: "admin",
        isAdmin: true,
        password: "", // Hashed password would go here in real app
        firebaseUid: "sample-firebase-uid-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Sample donor profiles
    const donorProfiles = [
      {
        id: "1",
        userId: "1", // Refers to john_donor
        status: "Available",
        badge: "Gold",
        totalDonations: 25,
        litersDonated: 11250, // 25 donations * 450ml
        livesSaved: 75,
        lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        nextEligibleDate: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(), // Already eligible
        verificationStatus: "Verified",
        isVisible: true
      }
    ];

    // Sample emergency requests
    const emergencyRequests = [
      {
        id: "1",
        requesterId: "2", // Refers to jane_requester
        patientName: "Alex Smith",
        bloodType: "A-",
        unitsNeeded: 3,
        urgency: "Urgent",
        hospitalName: "General Hospital",
        hospitalAddress: "123 Main St",
        hospitalCity: "Kathmandu",
        hospitalState: "Bagmati",
        latitude: 27.7172,
        longitude: 85.3240,
        contactName: "Jane Doe",
        contactPhone: "123-456-7890",
        contactRelation: "Sister",
        status: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      }
    ];

    // Sample donation records
    const donationRecords = [
      {
        id: "1",
        donorId: "1", // Refers to john_donor
        bloodType: "O+",
        donationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        volume: 450, // In milliliters
        location: "Blood Bank Center",
        donationType: "Regular",
        status: "Completed"
      }
    ];

    // Sample documents
    const documents = [
      {
        id: "1",
        userId: "1", // Refers to john_donor
        documentType: "ID",
        documentName: "Government ID",
        fileUrl: "https://example.com/fake-document-url",
        fileType: "image/jpeg",
        verificationStatus: "Verified",
        uploadedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
        verifiedAt: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString() // 115 days ago
      }
    ];

    // Write data to Firebase using more robust error handling
    try {
      console.log("Writing sample users...");
      const usersRef = database.ref('users');
      const userPromises = users.map(user => 
        usersRef.child(user.id).set(user)
          .catch(err => console.error(`Error writing user ${user.id}:`, err))
      );
      await Promise.all(userPromises);
      
      console.log("Writing sample donor profiles...");
      const donorProfilesRef = database.ref('donorProfiles');
      const profilePromises = donorProfiles.map(profile => 
        donorProfilesRef.child(profile.id).set(profile)
          .catch(err => console.error(`Error writing profile ${profile.id}:`, err))
      );
      await Promise.all(profilePromises);
      
      console.log("Writing sample emergency requests...");
      const emergencyRequestsRef = database.ref('emergencyRequests');
      const requestPromises = emergencyRequests.map(request => 
        emergencyRequestsRef.child(request.id).set(request)
          .catch(err => console.error(`Error writing request ${request.id}:`, err))
      );
      await Promise.all(requestPromises);
      
      console.log("Writing sample donation records...");
      const donationRecordsRef = database.ref('donationRecords');
      const recordPromises = donationRecords.map(record => 
        donationRecordsRef.child(record.id).set(record)
          .catch(err => console.error(`Error writing record ${record.id}:`, err))
      );
      await Promise.all(recordPromises);
      
      console.log("Writing sample documents...");
      const documentsRef = database.ref('documents');
      const documentPromises = documents.map(document => 
        documentsRef.child(document.id).set(document)
          .catch(err => console.error(`Error writing document ${document.id}:`, err))
      );
      await Promise.all(documentPromises);
      
      console.log("Firebase database initialization completed successfully!");
      process.exit(0);
    } catch (error) {
      console.error("Error during batch database writes:", error);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
}

// Run initialization
initializeData();
