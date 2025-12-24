import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { database } from './firebase';

// Type definitions for database schemas
export interface UserSchema {
  id: string;
  uid: string; // Firebase UID
  username: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  profileImageUrl?: string;
  photoURL?: string; // Google profile photo
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  role: "donor" | "requester" | "admin" | "volunteer" | "moderator";
  isAdmin: boolean;
  profileCompleted?: boolean; // For Google sign-up users
  
  // Location information
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Medical information
  medicalInfo?: {
    weight?: number; // in kg
    lastDonationDate?: number;
    medicalConditions?: string[];
    medications?: string[];
    allergies?: string[];
    eligibilityStatus?: "Eligible" | "Ineligible" | "Pending";
  };
  
  // Contact preferences
  contactPreferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    emergencyAlerts: boolean;
    marketingEmails: boolean;
  };
  
  // Privacy settings
  privacySettings?: {
    profileVisibility: "Public" | "DonorsOnly" | "Private";
    showLocation: boolean;
    showContactInfo: boolean;
    showDonationHistory: boolean;
  };
  
  // Account status - make these optional for backward compatibility
  accountStatus?: "Active" | "Suspended" | "Deactivated";
  verificationStatus?: "Unverified" | "Pending" | "Verified";
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export interface DonorProfileSchema {
  id: string;
  userId: string;
  status: "Available" | "Unavailable" | "Busy" | "Temporarily_Unavailable";
  badge: "Bronze" | "Silver" | "Gold" | "Platinum";
  
  // Donation statistics
  totalDonations: number;
  litersDonated: number;
  livesSaved: number;
  donationStreak: number; // consecutive donations
  lastDonationDate?: number;
  nextEligibleDate?: number;
  
  // Location and availability
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  travelRadius: number; // km willing to travel
  
  // Availability schedule
  availableTimeSlots?: {
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  
  // Emergency availability
  emergencyAvailable: boolean;
  emergencyContactTime: "Immediate" | "Within_1_Hour" | "Within_3_Hours" | "Within_6_Hours";
  
  // Medical and verification
  medicalClearance?: {
    lastCheckupDate?: number;
    clearanceStatus: "Valid" | "Expired" | "Pending";
    expiryDate?: number;
    doctorNotes?: string;
  };
  
  verificationStatus: "Unverified" | "Pending" | "Verified" | "Rejected";
  verifiedBy?: string;
  verifiedAt?: number;
  
  // Preferences
  preferredDonationCenters?: string[];
  transportationNeeded: boolean;
  languagePreferences?: string[];
  
  // Public profile settings
  isVisible: boolean;
  showContactInfo: boolean;
  profileDescription?: string;
  
  // Achievements and recognition
  achievements?: {
    type: string;
    title: string;
    description: string;
    earnedAt: number;
  }[];
  
  // Feedback and ratings
  rating?: {
    averageRating: number;
    totalReviews: number;
    lastReviewDate?: number;
  };
  
  createdAt: number;
  updatedAt: number;
}

export interface EmergencyRequestSchema {
  id: string;
  requesterId: string;
  
  // Patient information
  patientName: string;
  patientAge?: number;
  patientGender?: "Male" | "Female" | "Other";
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  unitsNeeded: number;
  
  // Request details
  urgency: "Normal" | "Urgent" | "Critical" | "Life_Threatening";
  requestReason: string;
  medicalCondition?: string;
  
  // Hospital information
  hospitalName: string;
  hospitalAddress: string;
  hospitalCity: string;
  hospitalState: string;
  hospitalCountry?: string;
  hospitalZipCode?: string;
  latitude: number;
  longitude: number;
  hospitalPhone?: string;
  
  // Contact information
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  contactRelation: string;
  alternateContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  
  // Request status and matching
  status: "Active" | "Matching" | "Donors_Found" | "Fulfilled" | "Cancelled" | "Expired";
  priority: number; // 1-10, 10 being highest
  donorIds?: string[]; // Matched donors
  interestedDonorIds?: string[]; // Donors who showed interest
  
  // Timeline
  neededBy?: number; // Timestamp when blood is needed
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  fulfilledAt?: number;
  
  // Additional information
  notes?: string;
  specialRequirements?: string[];
  bloodComponents?: "Whole_Blood" | "Red_Cells" | "Platelets" | "Plasma" | "All";
  
  // Communication
  lastNotificationSent?: number;
  notificationCount: number;
  
  // Verification
  hospitalVerified: boolean;
  requestVerified: boolean;
  verifiedBy?: string;
}

export interface DonationRecordSchema {
  id: string;
  donorId: string;
  recipientId?: string;
  emergencyRequestId?: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  donationDate: number;
  volume: number; // in milliliters
  location: string;
  donationType: "Regular" | "Emergency" | "Apheresis";
  status: "Scheduled" | "Completed" | "Cancelled";
  verifiedBy?: string;
  notes?: string;
}

export interface DocumentSchema {
  id: string;
  userId: string;
  documentType: "ID" | "MedicalRecord" | "BloodTest" | "Other";
  documentName: string;
  fileUrl: string;
  fileType: string;
  verificationStatus: "Unverified" | "Pending" | "Verified";
  notes?: string;
  uploadedAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
}

export interface NotificationSchema {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "EmergencyRequest" | "RequestMatch" | "DonationReminder" | "Verification" | "System";
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: "EmergencyRequest" | "DonationRecord" | "Document";
  createdAt: number;
}

export interface BloodInventorySchema {
  id: string;
  cityId: string;
  cityName: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  unitsAvailable: number;
  status: "Critical" | "Low" | "Adequate" | "Good";
  lastUpdated: number;
}

export interface LocationSchema {
  id: string;
  name: string;
  type: "Hospital" | "BloodBank" | "DonationCenter";
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  contactPhone?: string;
  website?: string;
  operatingHours?: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
}

// Database utility functions with performance optimizations
export const dbService = {
  // Cache for frequently accessed data
  _cache: new Map<string, { data: any; timestamp: number; ttl: number }>(),
  
  // Cache TTL in milliseconds (5 minutes default)
  _defaultTTL: 5 * 60 * 1000,
  
  // Helper function to get cached data
  _getCached<T>(key: string, ttl: number = this._defaultTTL): T | null {
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  },
  
  // Helper function to set cached data
  _setCached(key: string, data: any, ttl: number = this._defaultTTL): void {
    this._cache.set(key, { data, timestamp: Date.now(), ttl });
  },

  // Generic CRUD functions with caching
  create: async <T>(path: string, data: T): Promise<string> => {
    try {
      const newRef = push(ref(database, path));
      const id = newRef.key as string;
      await set(newRef, { id, ...data });
      
      // Clear related cache entries
      dbService._cache.delete(`${path}_all`);
      
      return id;
    } catch (error) {
      console.error(`Error creating record at ${path}:`, error);
      throw error;
    }
  },

  update: async <T>(path: string, id: string, data: Partial<T>): Promise<void> => {
    try {
      const recordRef = ref(database, `${path}/${id}`);
      const updateData = { ...data, updatedAt: Date.now() };
      await update(recordRef, updateData);
      
      // Clear cache for this record and collection
      dbService._cache.delete(`${path}_${id}`);
      dbService._cache.delete(`${path}_all`);
    } catch (error) {
      console.error(`Error updating record ${id} at ${path}:`, error);
      throw error;
    }
  },

  get: async <T>(path: string, id: string): Promise<T | null> => {
    try {
      const cacheKey = `${path}_${id}`;
      
      // Check cache first
      const cached = dbService._getCached<T>(cacheKey);
      if (cached) return cached;
      
      const recordRef = ref(database, `${path}/${id}`);
      const snapshot = await get(recordRef);
      const result = snapshot.exists() ? snapshot.val() as T : null;
      
      // Cache the result
      if (result) {
        dbService._setCached(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting record ${id} from ${path}:`, error);
      throw error;
    }
  },

  getAll: async <T>(path: string): Promise<T[]> => {
    try {
      const cacheKey = `${path}_all`;
      
      // Check cache first for frequently accessed collections
      if (['users', 'donorProfiles'].includes(path)) {
        const cached = dbService._getCached<T[]>(cacheKey);
        if (cached) return cached;
      }
      
      const listRef = ref(database, path);
      const snapshot = await get(listRef);
      let result: T[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        result = Object.values(data) as T[];
      }
      
      // Cache frequently accessed collections
      if (['users', 'donorProfiles'].includes(path)) {
        dbService._setCached(cacheKey, result, 2 * 60 * 1000); // 2 minutes for lists
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting all records from ${path}:`, error);
      throw error;
    }
  },

  delete: async (path: string, id: string): Promise<void> => {
    try {
      const recordRef = ref(database, `${path}/${id}`);
      await remove(recordRef);
      
      // Clear cache
      dbService._cache.delete(`${path}_${id}`);
      dbService._cache.delete(`${path}_all`);
    } catch (error) {
      console.error(`Error deleting record ${id} from ${path}:`, error);
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribe: <T>(path: string, callback: (data: T[]) => void): (() => void) => {
    const listRef = ref(database, path);
    
    const handleData = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(Object.values(data) as T[]);
      } else {
        callback([]);
      }
    };

    onValue(listRef, handleData);
    
    // Return an unsubscribe function
    return () => off(listRef);
  },

  // Subscribe to a single entity
  subscribeToOne: <T>(path: string, id: string, callback: (data: T | null) => void): (() => void) => {
    const recordRef = ref(database, `${path}/${id}`);
    
    const handleData = (snapshot: DataSnapshot) => {
      callback(snapshot.exists() ? snapshot.val() as T : null);
    };

    onValue(recordRef, handleData);
    
    // Return an unsubscribe function
    return () => off(recordRef);
  },

  // Query methods
  queryByChild: async <T>(path: string, childKey: string, childValue: string | number | boolean): Promise<T[]> => {
    try {
      const queryRef = query(
        ref(database, path),
        orderByChild(childKey),
        equalTo(childValue)
      );
      
      const snapshot = await get(queryRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data) as T[];
      }
      return [];
    } catch (error) {
      console.error(`Error querying records from ${path}:`, error);
      throw error;
    }
  },

  // Specialized methods
  getUserByEmail: async (email: string): Promise<UserSchema | null> => {
    try {
      const users = await dbService.queryByChild<UserSchema>('users', 'email', email);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  },

  // Get donors by blood type
  getDonorsByBloodType: async (bloodType: string): Promise<UserSchema[]> => {
    try {
      return await dbService.queryByChild<UserSchema>('users', 'bloodType', bloodType);
    } catch (error) {
      console.error(`Error getting donors by blood type ${bloodType}:`, error);
      throw error;
    }
  },

  // Get active emergency requests
  getActiveEmergencyRequests: async (): Promise<EmergencyRequestSchema[]> => {
    try {
      const allRequests = await dbService.getAll<EmergencyRequestSchema>('emergencyRequests');
      const now = Date.now();
      return allRequests.filter(
        req => req.expiresAt > now && ['Pending', 'Matching'].includes(req.status)
      );
    } catch (error) {
      console.error('Error getting active emergency requests:', error);
      throw error;
    }
  },

  // Get user notifications
  getUserNotifications: async (userId: string): Promise<NotificationSchema[]> => {
    try {
      const notifications = await dbService.queryByChild<NotificationSchema>('notifications', 'userId', userId);
      return notifications.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    try {
      await dbService.update<NotificationSchema>('notifications', notificationId, { read: true });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  // Get donor profile
  getDonorProfile: async (userId: string): Promise<DonorProfileSchema | null> => {
    try {
      const profiles = await dbService.queryByChild<DonorProfileSchema>('donorProfiles', 'userId', userId);
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.error(`Error getting donor profile for user ${userId}:`, error);
      throw error;
    }
  },

  // Update donor location
  updateDonorLocation: async (
    userId: string, 
    latitude: number, 
    longitude: number
  ): Promise<void> => {
    try {
      // Update the user's location
      const user = await dbService.getUserById(userId);
      if (user) {
        await dbService.update<UserSchema>('users', userId, {
          location: {
            ...user.location,
            latitude,
            longitude,
          }
        });
      }

      // Update donor profile location
      const donorProfile = await dbService.getDonorProfile(userId);
      if (donorProfile) {
        await dbService.update<DonorProfileSchema>('donorProfiles', donorProfile.id, {
          latitude,
          longitude
        });
      }
    } catch (error) {
      console.error(`Error updating location for user ${userId}:`, error);
      throw error;
    }
  },

  // Get user by ID - utility function
  getUserById: async (userId: string): Promise<UserSchema | null> => {
    return await dbService.get<UserSchema>('users', userId);
  },

  // Find nearby donors for emergency requests
  findNearbyDonors: async (
    latitude: number, 
    longitude: number, 
    bloodType: string,
    maxDistanceKm: number = 25
  ): Promise<UserSchema[]> => {
    try {
      // Get all donors with matching blood type
      let donors = await dbService.getDonorsByBloodType(bloodType);
      
      // Filter by donor profiles that are available
      const donorProfiles = await dbService.getAll<DonorProfileSchema>('donorProfiles');
      const availableDonorIds = donorProfiles
        .filter(profile => profile.status === 'Available' && profile.verificationStatus === 'Verified')
        .map(profile => profile.userId);
      
      donors = donors.filter(donor => 
        availableDonorIds.includes(donor.id) && 
        donor.location?.latitude && 
        donor.location?.longitude
      );
      
      // Calculate distance for each donor and filter by max distance
      return donors.filter(donor => {
        if (!donor.location?.latitude || !donor.location?.longitude) return false;
        
        const distance = calculateDistance(
          latitude, 
          longitude, 
          donor.location.latitude, 
          donor.location.longitude
        );
        
        // Add distance to donor object for sorting
        (donor as any).distance = distance;
        
        return distance <= maxDistanceKm;
      })
      // Sort by distance
      .sort((a, b) => (a as any).distance - (b as any).distance);
    } catch (error) {
      console.error('Error finding nearby donors:', error);
      throw error;
    }
  },
  
  // Create notification
  createNotification: async (notification: Omit<NotificationSchema, 'id' | 'createdAt'>): Promise<string> => {
    try {
      return await dbService.create<Omit<NotificationSchema, 'id'>>('notifications', {
        ...notification,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
};

// Helper Functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula to calculate distance between two points on the earth
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Export individual path constants for easier usage
export const DB_PATHS = {
  USERS: 'users',
  DONOR_PROFILES: 'donorProfiles',
  EMERGENCY_REQUESTS: 'emergencyRequests',
  DONATION_RECORDS: 'donationRecords',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  BLOOD_INVENTORY: 'bloodInventory',
  LOCATIONS: 'locations'
};
