import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { IStorage } from '../storage';
import { 
  User, 
  InsertUser,
  DonorProfile,
  InsertDonorProfile,
  EmergencyRequest,
  InsertEmergencyRequest,
  DonationRecord,
  InsertDonationRecord,
  Document,
  InsertDocument
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Load environment variables
      dotenv.config();
      
      const projectId = process.env.FIREBASE_PROJECT_ID || "blood-bank-f759d";
      const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/";
      
      console.log("Initializing Firebase Admin SDK...");
      console.log(`Project ID: ${projectId}`);
      console.log(`Database URL: ${databaseURL}`);
      
      // Check for service account file
      const serviceAccountPath = path.join(process.cwd(), 'firebase-credentials.json');
      
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
        console.error("No service account file found at", serviceAccountPath);
        console.error("Please create firebase-credentials.json in the project root.");
        return false;
      }
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      return false;
    }
  }
  return true; // Already initialized
}

// Convert PostgreSQL numeric IDs to Firebase string IDs
type FirebaseUser = Omit<User, 'id'> & { id: string };
type FirebaseDonorProfile = Omit<DonorProfile, 'id' | 'userId'> & { id: string, userId: string };
type FirebaseEmergencyRequest = Omit<EmergencyRequest, 'id' | 'requesterId'> & { id: string, requesterId: string };
type FirebaseDonationRecord = Omit<DonationRecord, 'id' | 'donorId' | 'recipientId' | 'emergencyRequestId'> & { 
  id: string, 
  donorId: string, 
  recipientId?: string, 
  emergencyRequestId?: string 
};
type FirebaseDocument = Omit<Document, 'id' | 'userId' | 'verifiedBy'> & { 
  id: string, 
  userId: string, 
  verifiedBy?: string 
};

// Type for combined donor data
type DonorWithProfile = User & { donorProfile: DonorProfile };

// Helper types for analytics
type RecentActivity = {
  id: string;
  type: "match" | "fulfilled" | "request";
  message: string;
  timeAgo: string;
};

type CityInventory = {
  id: string;
  name: string;
  status: "Critical" | "Low" | "Stable";
  inventoryLevels: {
    type: string;
    percentage: number;
  }[];
};

type DonorCity = {
  id: string;
  name: string;
  value: number;
  percentage: number;
};

type AdminStats = {
  totalDonors: number;
  activeEmergencies: number;
  donationsThisMonth: number;
  livesSaved: number;
  growth: {
    donors: number;
    emergencies: number;
    donations: number;
  };
};

export class FirebaseDatabase implements IStorage {
  private db: admin.database.Database | null;
  sessionStore: session.Store;

  constructor() {
    // Initialize Firebase Admin SDK
    const initialized = initializeFirebaseAdmin();
    
    // Set up database reference only if initialization was successful
    if (initialized) {
      try {
        this.db = getDatabase();
        console.log("Firebase Realtime Database connection established");
      } catch (error) {
        console.error("Failed to get Firebase database:", error);
        this.db = null;
      }
    } else {
      this.db = null;
      console.error("WARNING: Firebase not initialized. Database operations will fail.");
    }
    
    // Use memory store for session storage
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // Helper method to ensure database is initialized
  private ensureDatabase() {
    if (!this.db) {
      throw new Error("Firebase Realtime Database not initialized");
    }
    return this.db;
  }

  // ============= User Methods =============
  
  async getUser(id: number): Promise<User | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref(`users/${id}`).once('value');
    const user = snapshot.val() as FirebaseUser | null;
    
    if (!user) return undefined;
    
    return {
      ...user,
      id: Number(user.id)
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('users')
      .orderByChild('username')
      .equalTo(username)
      .limitToFirst(1)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) return undefined;
    
    // Extract first user from the results
    const userId = Object.keys(data)[0];
    const user = data[userId] as FirebaseUser;
    
    return {
      ...user,
      id: Number(userId)
    };
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('users')
      .orderByChild('email')
      .equalTo(email)
      .limitToFirst(1)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) return undefined;
    
    // Extract first user from the results
    const userId = Object.keys(data)[0];
    const user = data[userId] as FirebaseUser;
    
    return {
      ...user,
      id: Number(userId)
    };
  }
  
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('users')
      .orderByChild('firebaseUid')
      .equalTo(uid)
      .limitToFirst(1)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) return undefined;
    
    // Extract first user from the results
    const userId = Object.keys(data)[0];
    const user = data[userId] as FirebaseUser;
    
    return {
      ...user,
      id: Number(userId)
    };
  }

  async createUser(userData: InsertUser): Promise<User> {
    const db = this.ensureDatabase();
    // Get a new key from Firebase
    const newUserRef = db.ref('users').push();
    const id = Number(newUserRef.key);
    
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    // Use the key as an ID property in the data as well
    await newUserRef.set({
      ...user,
      id: id.toString() // Store as string for consistency in Firebase
    });
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const db = this.ensureDatabase();
    const userRef = db.ref(`users/${id}`);
    const snapshot = await userRef.once('value');
    
    if (!snapshot.exists()) {
      throw new Error("User not found");
    }
    
    const updatedData = {
      ...userData,
      updatedAt: new Date()
    };
    
    await userRef.update(updatedData);
    
    // Get the updated user data
    const updatedSnapshot = await userRef.once('value');
    const updatedUser = updatedSnapshot.val() as FirebaseUser;
    
    return {
      ...updatedUser,
      id: Number(updatedUser.id)
    };
  }
  
  async getAllUsers(): Promise<User[]> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('users').once('value');
    const usersData = snapshot.val();
    
    if (!usersData) return [];
    
    return Object.keys(usersData).map(key => {
      const user = usersData[key] as FirebaseUser;
      return {
        ...user,
        id: Number(user.id)
      };
    });
  }

  // ============= Donor Profile Methods =============
  
  async getDonorProfileByUserId(userId: number): Promise<DonorProfile | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('donorProfiles')
      .orderByChild('userId')
      .equalTo(userId.toString())
      .limitToFirst(1)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) return undefined;
    
    // Extract the donor profile from the results
    const profileId = Object.keys(data)[0];
    const profile = data[profileId] as FirebaseDonorProfile;
    
    return {
      ...profile,
      id: Number(profile.id),
      userId: Number(profile.userId)
    };
  }
  
  async createDonorProfile(profileData: InsertDonorProfile): Promise<DonorProfile> {
    const db = this.ensureDatabase();
    // Get a new key from Firebase
    const newProfileRef = db.ref('donorProfiles').push();
    const id = Number(newProfileRef.key);
    
    const profile: DonorProfile = {
      id,
      ...profileData
    };
    
    // Convert userId to string for Firebase
    await newProfileRef.set({
      ...profile,
      id: id.toString(),
      userId: profileData.userId.toString()
    });
    
    return profile;
  }
  
  async updateDonorProfile(userId: number, profileData: Partial<DonorProfile>): Promise<DonorProfile> {
    const db = this.ensureDatabase();
    // First, find the profile by userId
    const snapshot = await db.ref('donorProfiles')
      .orderByChild('userId')
      .equalTo(userId.toString())
      .limitToFirst(1)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) {
      throw new Error("Donor profile not found");
    }
    
    // Extract the donor profile from the results
    const profileId = Object.keys(data)[0];
    
    // Update the profile
    await db.ref(`donorProfiles/${profileId}`).update(profileData);
    
    // Get the updated profile
    const updatedSnapshot = await db.ref(`donorProfiles/${profileId}`).once('value');
    const updatedProfile = updatedSnapshot.val() as FirebaseDonorProfile;
    
    return {
      ...updatedProfile,
      id: Number(updatedProfile.id),
      userId: Number(updatedProfile.userId)
    };
  }
  
  async getAllDonors(): Promise<(User & { donorProfile: DonorProfile })[]> {
    const db = this.ensureDatabase();
    // Get all users with role 'donor'
    const usersSnapshot = await db.ref('users')
      .orderByChild('role')
      .equalTo('donor')
      .once('value');
    
    const usersData = usersSnapshot.val();
    
    if (!usersData) return [];
    
    // Get all donor profiles
    const profilesSnapshot = await db.ref('donorProfiles').once('value');
    const profilesData = profilesSnapshot.val();
    
    if (!profilesData) return [];
    
    // Map of userId to donorProfile
    const profilesByUserId = new Map<string, DonorProfile>();
    
    Object.keys(profilesData).forEach(key => {
      const profile = profilesData[key] as FirebaseDonorProfile;
      profilesByUserId.set(profile.userId, {
        ...profile,
        id: Number(profile.id),
        userId: Number(profile.userId)
      });
    });
    
    // Combine user data with donor profiles
    return Object.keys(usersData)
      .map(key => {
        const user = usersData[key] as FirebaseUser;
        const donorProfile = profilesByUserId.get(user.id);
        
        if (!donorProfile) return null;
        
        // Generate random locations around Kathmandu for demo
        const latBase = 27.7172;
        const lngBase = 85.3240;
        
        const latitude = latBase + (Math.random() - 0.5) * 0.05;
        const longitude = lngBase + (Math.random() - 0.5) * 0.05;
        const distance = Math.round((Math.random() * 10) * 10) / 10; // 0-10 km, 1 decimal
        
        return {
          ...user,
          id: Number(user.id),
          latitude,
          longitude,
          distance,
          status: Math.random() > 0.3 ? 'Available' : 'Unavailable',
          donorProfile
        };
      })
      .filter(item => item !== null) as DonorWithProfile[];
  }
  
  async getDonorsByBloodType(bloodType: string): Promise<(User & { donorProfile: DonorProfile })[]> {
    // Get all users with specified blood type
    const donors = await this.getAllDonors();
    
    // Filter to only include donors with the specified blood type
    return donors.filter(donor => donor.bloodType === bloodType);
  }
  
  async getTopDonors(limit: number = 3): Promise<(User & { donorProfile: DonorProfile })[]> {
    // Get all donors with their profiles
    const donors = await this.getAllDonors();
    
    // Sort by total donations in descending order
    return donors
      .sort((a, b) => b.donorProfile.totalDonations - a.donorProfile.totalDonations)
      .slice(0, limit);
  }
  
  async updateDonorStats(donorId: number, donationVolume: number): Promise<void> {
    const user = await this.getUser(donorId);
    if (!user || user.role !== 'donor') {
      throw new Error("Donor not found");
    }
    
    const profile = await this.getDonorProfileByUserId(donorId);
    if (!profile) {
      throw new Error("Donor profile not found");
    }
    
    // Update donor profile stats
    await this.updateDonorProfile(donorId, {
      totalDonations: profile.totalDonations + 1,
      litersDonated: profile.litersDonated + donationVolume,
      livesSaved: profile.livesSaved + Math.floor(donationVolume / 150), // 450ml can save up to 3 lives
      lastDonationDate: new Date(),
      // Set next eligible date to 56 days from now
      nextEligibleDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000)
    });
    
    // Determine badge based on total donations
    let badge: "Bronze" | "Silver" | "Gold" = "Bronze";
    if (profile.totalDonations + 1 >= 20) {
      badge = "Gold";
    } else if (profile.totalDonations + 1 >= 10) {
      badge = "Silver";
    }
    
    await this.updateDonorProfile(donorId, { badge });
  }

  // ============= Emergency Request Methods =============
  
  async createEmergencyRequest(requestData: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const db = this.ensureDatabase();
    // Get a new key from Firebase
    const newRequestRef = db.ref('emergencyRequests').push();
    const id = Number(newRequestRef.key);
    const now = new Date().toISOString();
    
    const request: EmergencyRequest = {
      id,
      ...requestData,
      createdAt: now,
      updatedAt: now
    };
    
    // Convert requesterId to string for Firebase
    await newRequestRef.set({
      ...request,
      id: id.toString(),
      requesterId: requestData.requesterId.toString()
    });
    
    return request;
  }
  
  async getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref(`emergencyRequests/${id}`).once('value');
    const request = snapshot.val() as FirebaseEmergencyRequest | null;
    
    if (!request) return undefined;
    
    return {
      ...request,
      id: Number(request.id),
      requesterId: Number(request.requesterId)
    };
  }
  
  async updateEmergencyRequest(id: number, requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
    const db = this.ensureDatabase();
    const requestRef = db.ref(`emergencyRequests/${id}`);
    const snapshot = await requestRef.once('value');
    
    if (!snapshot.exists()) {
      throw new Error("Emergency request not found");
    }
    
    const updatedData = {
      ...requestData,
      updatedAt: new Date().toISOString()
    };
    
    await requestRef.update(updatedData);
    
    // Get the updated request data
    const updatedSnapshot = await requestRef.once('value');
    const updatedRequest = updatedSnapshot.val() as FirebaseEmergencyRequest;
    
    return {
      ...updatedRequest,
      id: Number(updatedRequest.id),
      requesterId: Number(updatedRequest.requesterId)
    };
  }
  
  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('emergencyRequests').once('value');
    const requestsData = snapshot.val();
    
    if (!requestsData) return [];
    
    return Object.keys(requestsData).map(key => {
      const request = requestsData[key] as FirebaseEmergencyRequest;
      return {
        ...request,
        id: Number(request.id),
        requesterId: Number(request.requesterId)
      };
    });
  }
  
  async getActiveEmergencyRequests(): Promise<EmergencyRequest[]> {
    const now = new Date();
    const requests = await this.getAllEmergencyRequests();
    
    return requests.filter(request => {
      return new Date(request.expiresAt) > now && 
             ['Pending', 'Matching'].includes(request.status);
    });
  }

  // ============= Donation Record Methods =============
  
  async createDonationRecord(recordData: InsertDonationRecord): Promise<DonationRecord> {
    const db = this.ensureDatabase();
    // Get a new key from Firebase
    const newRecordRef = db.ref('donationRecords').push();
    const id = Number(newRecordRef.key);
    
    const record: DonationRecord = {
      id,
      ...recordData
    };
    
    // Prepare record data with string IDs for Firebase
    const firebaseRecord = {
      ...record,
      id: id.toString(),
      donorId: recordData.donorId.toString()
    };
    
    // Add optional fields if they exist
    if (recordData.recipientId) {
      (firebaseRecord as any).recipientId = recordData.recipientId.toString();
    }
    
    if (recordData.emergencyRequestId) {
      (firebaseRecord as any).emergencyRequestId = recordData.emergencyRequestId.toString();
    }
    
    await newRecordRef.set(firebaseRecord);
    
    return record;
  }
  
  async getDonationsByDonorId(donorId: number): Promise<DonationRecord[]> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('donationRecords')
      .orderByChild('donorId')
      .equalTo(donorId.toString())
      .once('value');
    
    const recordsData = snapshot.val();
    
    if (!recordsData) return [];
    
    return Object.keys(recordsData)
      .map(key => {
        const record = recordsData[key] as FirebaseDonationRecord;
        
        const result: DonationRecord = {
          ...record,
          id: Number(record.id),
          donorId: Number(record.donorId)
        };
        
        // Handle optional fields
        if (record.recipientId) {
          result.recipientId = Number(record.recipientId);
        }
        
        if (record.emergencyRequestId) {
          result.emergencyRequestId = Number(record.emergencyRequestId);
        }
        
        return result;
      })
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
  }
  
  async getAllDonations(): Promise<DonationRecord[]> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('donationRecords').once('value');
    const recordsData = snapshot.val();
    
    if (!recordsData) return [];
    
    return Object.keys(recordsData).map(key => {
      const record = recordsData[key] as FirebaseDonationRecord;
      
      const result: DonationRecord = {
        ...record,
        id: Number(record.id),
        donorId: Number(record.donorId)
      };
      
      // Handle optional fields
      if (record.recipientId) {
        result.recipientId = Number(record.recipientId);
      }
      
      if (record.emergencyRequestId) {
        result.emergencyRequestId = Number(record.emergencyRequestId);
      }
      
      return result;
    });
  }

  // ============= Document Methods =============
  
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const db = this.ensureDatabase();
    // Get a new key from Firebase
    const newDocRef = db.ref('documents').push();
    const id = Number(newDocRef.key);
    const now = new Date().toISOString();
    
    const document: Document = {
      id,
      ...documentData,
      uploadedAt: now,
      verifiedAt: null
    };
    
    // Prepare document data with string IDs for Firebase
    await newDocRef.set({
      ...document,
      id: id.toString(),
      userId: documentData.userId.toString()
    });
    
    return document;
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref(`documents/${id}`).once('value');
    const document = snapshot.val() as FirebaseDocument | null;
    
    if (!document) return undefined;
    
    const result: Document = {
      ...document,
      id: Number(document.id),
      userId: Number(document.userId)
    };
    
    // Handle optional fields
    if (document.verifiedBy) {
      result.verifiedBy = document.verifiedBy;
    }
    
    return result;
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const db = this.ensureDatabase();
    const snapshot = await db.ref('documents')
      .orderByChild('userId')
      .equalTo(userId.toString())
      .once('value');
    
    const documentsData = snapshot.val();
    
    if (!documentsData) return [];
    
    return Object.keys(documentsData)
      .map(key => {
        const document = documentsData[key] as FirebaseDocument;
        
        const result: Document = {
          ...document,
          id: Number(document.id),
          userId: Number(document.userId)
        };
        
        // Handle optional fields
        if (document.verifiedBy) {
          result.verifiedBy = document.verifiedBy;
        }
        
        return result;
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }
  
  async verifyDocument(id: number, status: string, notes?: string): Promise<Document> {
    const db = this.ensureDatabase();
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const documentRef = db.ref(`documents/${id}`);
    
    const updatedData = {
      verificationStatus: status,
      notes: notes || document.notes,
      verifiedAt: new Date().toISOString()
    };
    
    await documentRef.update(updatedData);
    
    // If all documents are verified, update user's verification status
    if (status === 'Verified') {
      const userDocuments = await this.getDocumentsByUserId(document.userId);
      const allVerified = userDocuments.every(doc => doc.verificationStatus === 'Verified');
      
      if (allVerified) {
        const profile = await this.getDonorProfileByUserId(document.userId);
        if (profile) {
          await this.updateDonorProfile(document.userId, {
            verificationStatus: 'Verified'
          });
        }
      }
    }
    
    // Get the updated document
    const updatedSnapshot = await documentRef.once('value');
    const updatedDocument = updatedSnapshot.val() as FirebaseDocument;
    
    const result: Document = {
      ...updatedDocument,
      id: Number(updatedDocument.id),
      userId: Number(updatedDocument.userId)
    };
    
    // Handle optional fields
    if (updatedDocument.verifiedBy) {
      result.verifiedBy = updatedDocument.verifiedBy;
    }
    
    return result;
  }

  // ============= Analytics Methods =============
  
  async getRecentActivities(): Promise<RecentActivity[]> {
    // This would normally be built from real data
    // For demo purposes, we're returning placeholder data
    return [
      {
        id: "1",
        type: "match",
        message: "A+ donor matched in New York",
        timeAgo: "2 minutes ago"
      },
      {
        id: "2",
        type: "fulfilled",
        message: "Emergency request fulfilled in Chicago",
        timeAgo: "15 minutes ago"
      },
      {
        id: "3",
        type: "request",
        message: "New O- request in Los Angeles",
        timeAgo: "28 minutes ago"
      }
    ];
  }
  
  async getCityInventory(): Promise<CityInventory[]> {
    // This would normally be built from real data
    // For demo purposes, we're returning placeholder data
    return [
      {
        id: "1",
        name: "New York City",
        status: "Critical",
        inventoryLevels: [
          { type: "O-", percentage: 10 },
          { type: "A+", percentage: 45 }
        ]
      },
      {
        id: "2",
        name: "Los Angeles",
        status: "Low",
        inventoryLevels: [
          { type: "B+", percentage: 30 },
          { type: "AB-", percentage: 55 }
        ]
      },
      {
        id: "3",
        name: "Chicago",
        status: "Stable",
        inventoryLevels: [
          { type: "A-", percentage: 85 },
          { type: "O+", percentage: 90 }
        ]
      },
      {
        id: "4",
        name: "Houston",
        status: "Critical",
        inventoryLevels: [
          { type: "O+", percentage: 25 },
          { type: "B-", percentage: 15 }
        ]
      }
    ];
  }
  
  async getTopDonorCities(): Promise<DonorCity[]> {
    // This would normally be built from real data
    // For demo purposes, we're returning placeholder data
    return [
      { id: "1", name: "San Francisco", value: 1245, percentage: 100 },
      { id: "2", name: "Seattle", value: 1053, percentage: 85 },
      { id: "3", name: "Boston", value: 928, percentage: 75 },
      { id: "4", name: "Austin", value: 804, percentage: 65 },
      { id: "5", name: "Denver", value: 682, percentage: 55 }
    ];
  }
  
  async getCitiesNeedingDonors(): Promise<DonorCity[]> {
    // This would normally be built from real data
    // For demo purposes, we're returning placeholder data
    return [
      { id: "1", name: "Detroit", value: 68, percentage: 100 },
      { id: "2", name: "Cleveland", value: 62, percentage: 90 },
      { id: "3", name: "Memphis", value: 55, percentage: 80 },
      { id: "4", name: "El Paso", value: 48, percentage: 70 },
      { id: "5", name: "Baltimore", value: 42, percentage: 60 }
    ];
  }

  // ============= Admin Methods =============
  
  async getAdminStats(): Promise<AdminStats> {
    // This would normally be calculated from real data
    // For demo purposes, we're returning placeholder data
    return {
      totalDonors: 8475,
      activeEmergencies: 14,
      donationsThisMonth: 327,
      livesSaved: 981,
      growth: {
        donors: 8.5,
        emergencies: -3.2,
        donations: 12.7
      }
    };
  }
}
