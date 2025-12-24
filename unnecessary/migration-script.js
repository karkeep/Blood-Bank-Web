// migration-script.js - Script to migrate data from PostgreSQL to Firebase Realtime Database
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll need to dynamically import the db and schema since they use TypeScript
let db, schema;

async function importDependencies() {
  try {
    // Dynamically import the db module
    const dbModule = await import('./server/db.js');
    db = dbModule.db;
    
    // Dynamically import the schema module
    const schemaModule = await import('./shared/schema.js');
    schema = schemaModule;
    
    console.log("Successfully imported database and schema modules");
  } catch (error) {
    console.error("Error importing dependencies:", error);
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || "jiwandan-blood-bank";
    const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://jiwandan-blood-bank-default-rtdb.firebaseio.com";
    
    console.log("Initializing Firebase Admin SDK for migration...");
    console.log(`Project ID: ${projectId}`);
    console.log(`Database URL: ${databaseURL}`);
    
    // Check for service account file
    const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log("Using Firebase service account from file:", serviceAccountPath);
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
      });
      
      console.log("Firebase Admin SDK initialized successfully");
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

async function migrateData() {
  try {
    // Import dependencies first
    await importDependencies();
    
    // Initialize Firebase
    const firebaseInitialized = await initializeFirebase();
    if (!firebaseInitialized) {
      console.error("Failed to initialize Firebase. Migration aborted.");
      process.exit(1);
    }
    
    // Get Firebase Realtime Database reference
    const database = admin.database();
    
    console.log("Starting migration from PostgreSQL to Firebase...");
    
    // Fetch data from PostgreSQL
    console.log("Fetching data from PostgreSQL...");
    
    const users = await db.select().from(schema.users);
    const donorProfiles = await db.select().from(schema.donorProfiles);
    const emergencyRequests = await db.select().from(schema.emergencyRequests);
    const donationRecords = await db.select().from(schema.donationRecords);
    const documents = await db.select().from(schema.documents);
    
    console.log(`Found ${users.length} users, ${donorProfiles.length} donor profiles, ${emergencyRequests.length} emergency requests, ${donationRecords.length} donation records, and ${documents.length} documents.`);
    
    // Migrate users
    console.log("Migrating users...");
    const usersRef = database.ref('users');
    for (const user of users) {
      const userRef = usersRef.child(user.id.toString());
      await userRef.set({
        ...user,
        id: user.id.toString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      });
    }
    
    // Migrate donor profiles
    console.log("Migrating donor profiles...");
    const donorProfilesRef = database.ref('donorProfiles');
    for (const profile of donorProfiles) {
      const profileRef = donorProfilesRef.child(profile.id.toString());
      await profileRef.set({
        ...profile,
        id: profile.id.toString(),
        userId: profile.userId.toString(),
        lastDonationDate: profile.lastDonationDate ? profile.lastDonationDate.toISOString() : null,
        nextEligibleDate: profile.nextEligibleDate ? profile.nextEligibleDate.toISOString() : null
      });
    }
    
    // Migrate emergency requests
    console.log("Migrating emergency requests...");
    const emergencyRequestsRef = database.ref('emergencyRequests');
    for (const request of emergencyRequests) {
      const requestRef = emergencyRequestsRef.child(request.id.toString());
      await requestRef.set({
        ...request,
        id: request.id.toString(),
        requesterId: request.requesterId.toString(),
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        expiresAt: request.expiresAt,
        donorIds: request.donorIds ? request.donorIds.map(id => id.toString()) : undefined
      });
    }
    
    // Migrate donation records
    console.log("Migrating donation records...");
    const donationRecordsRef = database.ref('donationRecords');
    for (const record of donationRecords) {
      const recordRef = donationRecordsRef.child(record.id.toString());
      const recordData = {
        ...record,
        id: record.id.toString(),
        donorId: record.donorId.toString(),
        donationDate: record.donationDate.toISOString()
      };
      
      // Handle optional fields
      if (record.recipientId) {
        recordData.recipientId = record.recipientId.toString();
      }
      
      if (record.emergencyRequestId) {
        recordData.emergencyRequestId = record.emergencyRequestId.toString();
      }
      
      await recordRef.set(recordData);
    }
    
    // Migrate documents
    console.log("Migrating documents...");
    const documentsRef = database.ref('documents');
    for (const document of documents) {
      const documentRef = documentsRef.child(document.id.toString());
      const documentData = {
        ...document,
        id: document.id.toString(),
        userId: document.userId.toString(),
        uploadedAt: document.uploadedAt,
        verifiedAt: document.verifiedAt
      };
      
      // Handle optional fields
      if (document.verifiedBy) {
        documentData.verifiedBy = document.verifiedBy.toString();
      }
      
      await documentRef.set(documentData);
    }
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run migration
migrateData();
