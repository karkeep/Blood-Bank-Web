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
  InsertDocument,
  users,
  donorProfiles,
  emergencyRequests,
  donationRecords,
  documents
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Define types for mock data
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

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Donor Profile Methods
  getDonorProfileByUserId(userId: number): Promise<DonorProfile | undefined>;
  createDonorProfile(profile: InsertDonorProfile): Promise<DonorProfile>;
  updateDonorProfile(userId: number, profileData: Partial<DonorProfile>): Promise<DonorProfile>;
  getAllDonors(): Promise<(User & { donorProfile: DonorProfile })[]>;
  getDonorsByBloodType(bloodType: string): Promise<(User & { donorProfile: DonorProfile })[]>;
  getTopDonors(limit?: number): Promise<(User & { donorProfile: DonorProfile })[]>;
  updateDonorStats(donorId: number, donationVolume: number): Promise<void>;
  
  // Emergency Request Methods
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined>;
  updateEmergencyRequest(id: number, requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest>;
  getAllEmergencyRequests(): Promise<EmergencyRequest[]>;
  getActiveEmergencyRequests(): Promise<EmergencyRequest[]>;
  
  // Donation Record Methods
  createDonationRecord(record: InsertDonationRecord): Promise<DonationRecord>;
  getDonationsByDonorId(donorId: number): Promise<DonationRecord[]>;
  getAllDonations(): Promise<DonationRecord[]>;
  
  // Document Methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentById(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  verifyDocument(id: number, status: string, notes?: string): Promise<Document>;
  
  // Analytics Methods
  getRecentActivities(): Promise<RecentActivity[]>;
  getCityInventory(): Promise<CityInventory[]>;
  getTopDonorCities(): Promise<DonorCity[]>;
  getCitiesNeedingDonors(): Promise<DonorCity[]>;
  
  // Admin Methods
  getAdminStats(): Promise<AdminStats>;
  
  // Session Store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donorProfiles: Map<number, DonorProfile>;
  private emergencyRequests: Map<number, EmergencyRequest>;
  private donationRecords: Map<number, DonationRecord>;
  private documents: Map<number, Document>;
  
  // Auto-increment IDs
  private userIdCounter: number;
  private donorProfileIdCounter: number;
  private requestIdCounter: number;
  private donationIdCounter: number;
  private documentIdCounter: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.donorProfiles = new Map();
    this.emergencyRequests = new Map();
    this.donationRecords = new Map();
    this.documents = new Map();
    
    this.userIdCounter = 1;
    this.donorProfileIdCounter = 1;
    this.requestIdCounter = 1;
    this.donationIdCounter = 1;
    this.documentIdCounter = 1;
    
    // Use a simple object to implement session.Store for in-memory storage
    this.sessionStore = {
      all: (callback: (err: any, obj?: { [sid: string]: session.SessionData } | null) => void) => { callback(null, {}); },
      destroy: (sid: string, callback?: (err?: any) => void) => { if (callback) callback(); },
      clear: (callback?: (err?: any) => void) => { if (callback) callback(); },
      length: (callback: (err: any, length?: number) => void) => { callback(null, 0); },
      get: (sid: string, callback: (err: any, session?: session.SessionData | null) => void) => { callback(null, null); },
      set: (sid: string, session: session.SessionData, callback?: (err?: any) => void) => { if (callback) callback(); },
      touch: (sid: string, session: session.SessionData, callback?: (err?: any) => void) => { if (callback) callback(); }
    } as session.Store;
    
    // Create an admin user
    this.createUser({
      username: "admin",
      email: "admin@lifelink.org",
      password: "$2a$10$XbGSGZUBn9hC8VsVtU5KxebkR9uHTNXKSVFTKLxvhRZwFTdYJ6MK2", // "password"
      bloodType: "O+",
      role: "admin",
      isAdmin: true
    });
  }

  // ============= User Methods =============
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      ...userData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // ============= Donor Profile Methods =============
  
  async getDonorProfileByUserId(userId: number): Promise<DonorProfile | undefined> {
    return Array.from(this.donorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createDonorProfile(profileData: InsertDonorProfile): Promise<DonorProfile> {
    const id = this.donorProfileIdCounter++;
    
    const profile: DonorProfile = {
      id,
      ...profileData
    };
    
    this.donorProfiles.set(id, profile);
    return profile;
  }
  
  async updateDonorProfile(userId: number, profileData: Partial<DonorProfile>): Promise<DonorProfile> {
    const profile = await this.getDonorProfileByUserId(userId);
    if (!profile) {
      throw new Error("Donor profile not found");
    }
    
    const updatedProfile: DonorProfile = {
      ...profile,
      ...profileData,
      userId, // Ensure userId doesn't change
    };
    
    this.donorProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllDonors(): Promise<(User & { donorProfile: DonorProfile })[]> {
    const donors: (User & { donorProfile: DonorProfile })[] = [];
    
    for (const user of this.users.values()) {
      if (user.role === 'donor') {
        const profile = await this.getDonorProfileByUserId(user.id);
        if (profile) {
          donors.push({ ...user, donorProfile: profile });
        }
      }
    }
    
    return donors;
  }
  
  async getDonorsByBloodType(bloodType: string): Promise<(User & { donorProfile: DonorProfile })[]> {
    const allDonors = await this.getAllDonors();
    return allDonors.filter(donor => donor.bloodType === bloodType);
  }
  
  async getTopDonors(limit: number = 3): Promise<(User & { donorProfile: DonorProfile })[]> {
    const allDonors = await this.getAllDonors();
    
    // Sort by total donations in descending order
    return allDonors
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
    const id = this.requestIdCounter++;
    const now = new Date().toISOString();
    
    const request: EmergencyRequest = {
      id,
      ...requestData,
      createdAt: now,
      updatedAt: now
    };
    
    this.emergencyRequests.set(id, request);
    return request;
  }
  
  async getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined> {
    return this.emergencyRequests.get(id);
  }
  
  async updateEmergencyRequest(id: number, requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
    const request = await this.getEmergencyRequestById(id);
    if (!request) {
      throw new Error("Emergency request not found");
    }
    
    const updatedRequest: EmergencyRequest = {
      ...request,
      ...requestData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    this.emergencyRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values());
  }
  
  async getActiveEmergencyRequests(): Promise<EmergencyRequest[]> {
    const now = new Date();
    return Array.from(this.emergencyRequests.values()).filter(request => {
      return new Date(request.expiresAt) > now && 
             ['Pending', 'Matching'].includes(request.status);
    });
  }

  // ============= Donation Record Methods =============
  
  async createDonationRecord(recordData: InsertDonationRecord): Promise<DonationRecord> {
    const id = this.donationIdCounter++;
    
    const record: DonationRecord = {
      id,
      ...recordData
    };
    
    this.donationRecords.set(id, record);
    return record;
  }
  
  async getDonationsByDonorId(donorId: number): Promise<DonationRecord[]> {
    return Array.from(this.donationRecords.values())
      .filter(record => record.donorId === donorId)
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
  }
  
  async getAllDonations(): Promise<DonationRecord[]> {
    return Array.from(this.donationRecords.values());
  }

  // ============= Document Methods =============
  
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date().toISOString();
    
    const document: Document = {
      id,
      ...documentData,
      uploadedAt: now,
      verifiedAt: null
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }
  
  async verifyDocument(id: number, status: string, notes?: string): Promise<Document> {
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const updatedDocument: Document = {
      ...document,
      verificationStatus: status,
      notes: notes || document.notes,
      verifiedAt: new Date().toISOString()
    };
    
    this.documents.set(id, updatedDocument);
    
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
    
    return updatedDocument;
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
      totalDonors: 2841,
      activeEmergencies: 7,
      donationsThisMonth: 149,
      livesSaved: 487,
      growth: {
        donors: 12,
        emergencies: 18,
        donations: 8
      }
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // ============= User Methods =============
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Handle bloodType separately to ensure type safety
    const bloodType = userData.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    const role = userData.role as "donor" | "requester" | "admin" || "donor";
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        bloodType,
        role
      })
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // ============= Donor Profile Methods =============
  
  async getDonorProfileByUserId(userId: number): Promise<DonorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(donorProfiles)
      .where(eq(donorProfiles.userId, userId));
    return profile;
  }
  
  async createDonorProfile(profileData: InsertDonorProfile): Promise<DonorProfile> {
    // Set default values and handle enums properly
    const status = (profileData.status || "Pending") as "Pending" | "Available" | "Unavailable";
    const badge = (profileData.badge || "Bronze") as "Bronze" | "Silver" | "Gold";
    const verificationStatus = (profileData.verificationStatus || "Unverified") as "Pending" | "Unverified" | "Verified";
    
    const [profile] = await db
      .insert(donorProfiles)
      .values({
        ...profileData,
        status,
        badge,
        verificationStatus
      })
      .returning();
    return profile;
  }
  
  async updateDonorProfile(userId: number, profileData: Partial<DonorProfile>): Promise<DonorProfile> {
    const [profile] = await db
      .select()
      .from(donorProfiles)
      .where(eq(donorProfiles.userId, userId));
      
    if (!profile) {
      throw new Error("Donor profile not found");
    }
    
    const [updatedProfile] = await db
      .update(donorProfiles)
      .set(profileData)
      .where(eq(donorProfiles.userId, userId))
      .returning();
      
    return updatedProfile;
  }
  
  async getAllDonors(): Promise<(User & { donorProfile: DonorProfile })[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, 'donor'))
      .leftJoin(donorProfiles, eq(users.id, donorProfiles.userId));
      
    return result.map(({ users, donor_profiles }) => ({
      ...users,
      donorProfile: donor_profiles as DonorProfile
    })).filter(donor => donor.donorProfile !== null);
  }
  
  async getDonorsByBloodType(bloodType: string): Promise<(User & { donorProfile: DonorProfile })[]> {
    // Ensure bloodType is one of the valid enum values
    const validBloodType = bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'donor'), eq(users.bloodType, validBloodType)))
      .leftJoin(donorProfiles, eq(users.id, donorProfiles.userId));
      
    return result.map(({ users, donor_profiles }) => ({
      ...users,
      donorProfile: donor_profiles as DonorProfile
    })).filter(donor => donor.donorProfile !== null);
  }
  
  async getTopDonors(limit: number = 3): Promise<(User & { donorProfile: DonorProfile })[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, 'donor'))
      .leftJoin(donorProfiles, eq(users.id, donorProfiles.userId))
      .orderBy(desc(donorProfiles.totalDonations))
      .limit(limit);
      
    return result.map(({ users, donor_profiles }) => ({
      ...users,
      donorProfile: donor_profiles as DonorProfile
    })).filter(donor => donor.donorProfile !== null);
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
      livesSaved: profile.livesSaved + Math.floor(donationVolume / 150),
      lastDonationDate: new Date(),
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
    // Handle bloodType separately to ensure type safety
    const bloodType = requestData.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    
    const [request] = await db
      .insert(emergencyRequests)
      .values({
        ...requestData,
        bloodType
      })
      .returning();
    return request;
  }
  
  async getEmergencyRequestById(id: number): Promise<EmergencyRequest | undefined> {
    const [request] = await db
      .select()
      .from(emergencyRequests)
      .where(eq(emergencyRequests.id, id));
    return request;
  }
  
  async updateEmergencyRequest(id: number, requestData: Partial<EmergencyRequest>): Promise<EmergencyRequest> {
    const [updatedRequest] = await db
      .update(emergencyRequests)
      .set({
        ...requestData,
        updatedAt: new Date()
      })
      .where(eq(emergencyRequests.id, id))
      .returning();
      
    if (!updatedRequest) {
      throw new Error("Emergency request not found");
    }
    
    return updatedRequest;
  }
  
  async getAllEmergencyRequests(): Promise<EmergencyRequest[]> {
    return db.select().from(emergencyRequests);
  }
  
  async getActiveEmergencyRequests(): Promise<EmergencyRequest[]> {
    const now = new Date();
    return db
      .select()
      .from(emergencyRequests)
      .where(
        and(
          sql`${emergencyRequests.expiresAt} > ${now}`,
          sql`${emergencyRequests.status} IN ('Pending', 'Matching')`
        )
      );
  }

  // ============= Donation Record Methods =============
  
  async createDonationRecord(recordData: InsertDonationRecord): Promise<DonationRecord> {
    // Handle bloodType separately to ensure type safety
    const bloodType = recordData.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    
    const [record] = await db
      .insert(donationRecords)
      .values({
        ...recordData,
        bloodType
      })
      .returning();
    return record;
  }
  
  async getDonationsByDonorId(donorId: number): Promise<DonationRecord[]> {
    return db
      .select()
      .from(donationRecords)
      .where(eq(donationRecords.donorId, donorId))
      .orderBy(desc(donationRecords.donationDate));
  }
  
  async getAllDonations(): Promise<DonationRecord[]> {
    return db.select().from(donationRecords);
  }

  // ============= Document Methods =============
  
  async createDocument(documentData: InsertDocument): Promise<Document> {
    // Set initial values for fields that need explicit initialization
    const now = new Date();
    const verificationStatus: "Pending" | "Unverified" | "Verified" = "Pending";
    
    const [document] = await db
      .insert(documents)
      .values({
        ...documentData,
        verificationStatus,
        uploadedAt: now,
        verifiedAt: null
      })
      .returning();
    return document;
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.uploadedAt));
  }
  
  async verifyDocument(id: number, status: string, notes?: string): Promise<Document> {
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const verificationStatus = status as "Unverified" | "Pending" | "Verified";
    
    const [updatedDocument] = await db
      .update(documents)
      .set({
        verificationStatus,
        notes: notes || document.notes,
        verifiedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    
    // If all documents are verified, update user's verification status
    if (status === 'Verified') {
      const userDocuments = await this.getDocumentsByUserId(document.userId);
      const allVerified = userDocuments.every(doc => doc.verificationStatus === 'Verified');
      
      if (allVerified) {
        const profile = await this.getDonorProfileByUserId(document.userId);
        if (profile) {
          await this.updateDonorProfile(document.userId, {
            verificationStatus: 'Verified' as const
          });
        }
      }
    }
    
    return updatedDocument;
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

// Initialize with database storage
export const storage = new DatabaseStorage();
