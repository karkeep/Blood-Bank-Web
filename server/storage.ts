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
import createMemoryStore from "memorystore";
import session from "express-session";

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

const MemoryStore = createMemoryStore(session);

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
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
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
    const now = new Date().toISOString();
    
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
      updatedAt: new Date().toISOString()
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
      lastDonationDate: new Date().toISOString(),
      // Set next eligible date to 56 days from now
      nextEligibleDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Determine badge based on total donations
    let badge = 'Bronze';
    if (profile.totalDonations + 1 >= 20) {
      badge = 'Gold';
    } else if (profile.totalDonations + 1 >= 10) {
      badge = 'Silver';
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

export const storage = new MemStorage();
