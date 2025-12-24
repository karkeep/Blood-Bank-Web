import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, push, update, remove, query, orderByChild, equalTo, limitToFirst, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blood-bank-f759d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blood-bank-f759d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blood-bank-f759d.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app;
let database;
let auth;

try {
  console.log('Initializing Firebase with config:', {
    apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId
  });

  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);

  console.log('Firebase initialized successfully');

} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create fallback for development
  console.warn('Using fallback configuration - some features may not work');
}

// Export for use in other files
export { database, auth };

// Types
export interface Donor {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  bloodType: string;
  phone?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  status: 'available' | 'busy' | 'inactive';
  lastDonation?: string;
  donations: number;
  badge?: 'Bronze' | 'Silver' | 'Gold';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  role: 'donor' | 'recipient' | 'admin' | 'moderator';
  isAdmin?: boolean;
  firebaseUid?: string;
}
export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodType: string;
  urgencyLevel: 'critical' | 'urgent' | 'standard';
  unitsNeeded: number;
  hospital: string;
  hospitalAddress: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
  status: 'pending' | 'matching' | 'fulfilled' | 'expired';
  requesterId?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodInventoryItem {
  id: string;
  type: string;
  units: number;
  location: string;
  expiresAt?: string;
  bloodBankId?: string;
  status: 'available' | 'low' | 'critical' | 'expired';
  lastUpdated: string;
}

export interface ContactRequest {
  id: string;
  donorId: string;
  requesterId?: string;
  contactType: 'call' | 'message' | 'request' | 'email';
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeDonors: number;
  pendingRequests: number;
  bloodUnits: number;
  emergencyRequests: number;
  moderators: number;
  growth: {
    users: number;
    donors: number;
    requests: number;
  };
}
// Utility function to generate ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Utility function to add location data to donors for demo
const addLocationData = (donors: Donor[]): Donor[] => {
  const kathmandu = { lat: 27.7172, lng: 85.3240 };

  return donors.map((donor, index) => {
    // Generate realistic locations around Kathmandu Valley
    const angle = (index * 45) % 360;
    const radius = Math.random() * 0.05; // Within ~5km of center
    const latitude = kathmandu.lat + Math.cos(angle * Math.PI / 180) * radius;
    const longitude = kathmandu.lng + Math.sin(angle * Math.PI / 180) * radius;
    const distance = `${(Math.random() * 10 + 0.5).toFixed(1)} km`;

    return {
      ...donor,
      latitude,
      longitude,
      distance,
      status: donor.status || (Math.random() > 0.3 ? 'available' : 'busy')
    };
  });
};

// ==== Sample Donor Data (for empty database fallback) ====
const sampleDonors: Partial<Donor>[] = [
  { username: 'rajesh_donor', fullName: 'Rajesh Sharma', email: 'rajesh@example.com', bloodType: 'O+', phone: '+977-9841234567', city: 'Kathmandu', status: 'available', donations: 5, badge: 'Silver', verificationStatus: 'verified', role: 'donor' },
  { username: 'priya_lifesaver', fullName: 'Priya Thapa', email: 'priya@example.com', bloodType: 'A+', phone: '+977-9851234567', city: 'Lalitpur', status: 'available', donations: 12, badge: 'Gold', verificationStatus: 'verified', role: 'donor' },
  { username: 'anil_hero', fullName: 'Anil Gurung', email: 'anil@example.com', bloodType: 'B-', phone: '+977-9861234567', city: 'Lalitpur', status: 'available', donations: 8, badge: 'Silver', verificationStatus: 'verified', role: 'donor' },
  { username: 'maya_angel', fullName: 'Maya Rai', email: 'maya@example.com', bloodType: 'O-', phone: '+977-9871234567', city: 'Bhaktapur', status: 'busy', donations: 15, badge: 'Gold', verificationStatus: 'verified', role: 'donor' },
  { username: 'binod_saver', fullName: 'Binod Magar', email: 'binod@example.com', bloodType: 'AB+', phone: '+977-9881234567', city: 'Kathmandu', status: 'available', donations: 3, badge: 'Bronze', verificationStatus: 'verified', role: 'donor' },
  { username: 'sita_helper', fullName: 'Sita Shrestha', email: 'sita@example.com', bloodType: 'A-', phone: '+977-9891234567', city: 'Kathmandu', status: 'available', donations: 7, badge: 'Silver', verificationStatus: 'verified', role: 'donor' },
  { username: 'ram_lifeline', fullName: 'Ram Basnet', email: 'ram@example.com', bloodType: 'B+', phone: '+977-9801234567', city: 'Pokhara', status: 'available', donations: 20, badge: 'Gold', verificationStatus: 'verified', role: 'donor' },
  { username: 'gita_savior', fullName: 'Gita Karki', email: 'gita@example.com', bloodType: 'AB-', phone: '+977-9811234567', city: 'Bhaktapur', status: 'available', donations: 4, badge: 'Bronze', verificationStatus: 'verified', role: 'donor' },
];

// ==== Donor API ====
export const donorAPI = {
  // Get all donors
  async getAllDonors(): Promise<Donor[]> {
    try {
      const donorsRef = ref(database, 'users');
      const snapshot = await get(query(donorsRef, orderByChild('role'), equalTo('donor')));

      if (!snapshot.exists()) {
        // Return sample donors with generated IDs and location data
        console.log('No donors in database, returning sample donors');
        const donorsWithIds = sampleDonors.map((donor, index) => ({
          id: `sample_donor_${index + 1}`,
          ...donor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastDonation: `${Math.floor(Math.random() * 6) + 1} months ago`
        })) as Donor[];
        return addLocationData(donorsWithIds);
      }

      const donorsData = snapshot.val();
      const donors = Object.keys(donorsData).map(key => ({
        id: key,
        ...donorsData[key]
      }));

      return addLocationData(donors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      // Return sample donors as fallback on error
      console.log('Database error, returning sample donors as fallback');
      const donorsWithIds = sampleDonors.map((donor, index) => ({
        id: `sample_donor_${index + 1}`,
        ...donor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastDonation: `${Math.floor(Math.random() * 6) + 1} months ago`
      })) as Donor[];
      return addLocationData(donorsWithIds);
    }
  },


  // Get donors by blood type
  async getDonorsByBloodType(bloodType: string): Promise<Donor[]> {
    try {
      const allDonors = await this.getAllDonors();
      return allDonors.filter(donor => donor.bloodType === bloodType);
    } catch (error) {
      console.error('Error fetching donors by blood type:', error);
      throw new Error('Failed to fetch donors by blood type');
    }
  },
  // Update donor status
  async updateDonorStatus(donorId: string, status: string): Promise<void> {
    try {
      const donorRef = ref(database, `users/${donorId}`);
      await update(donorRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating donor status:', error);
      throw new Error('Failed to update donor status');
    }
  },

  // Get top donors
  async getTopDonors(limit: number = 10): Promise<Donor[]> {
    try {
      const allDonors = await this.getAllDonors();
      return allDonors
        .sort((a, b) => (b.donations || 0) - (a.donations || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top donors:', error);
      throw new Error('Failed to fetch top donors');
    }
  }
};
// ==== Emergency Requests API ====
export const bloodRequestAPI = {
  // Get all emergency requests
  async getEmergencyRequests(): Promise<EmergencyRequest[]> {
    try {
      const requestsRef = ref(database, 'emergencyRequests');
      const snapshot = await get(requestsRef);

      if (!snapshot.exists()) {
        // Return sample emergency requests for demo purposes
        console.log('No emergency requests in database, returning sample requests');
        const now = new Date();
        return [
          {
            id: 'sample_1',
            patientName: 'Madan Bhandari',
            bloodType: 'O-',
            urgencyLevel: 'critical',
            unitsNeeded: 2,
            hospital: 'Bir Hospital',
            hospitalAddress: 'Kathmandu',
            contactName: 'Ram Bhandari',
            contactPhone: '+977-9841000000',
            status: 'pending',
            location: { latitude: 27.7052, longitude: 85.312 },
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
          },
          {
            id: 'sample_2',
            patientName: 'Sushila Karki',
            bloodType: 'AB-',
            urgencyLevel: 'urgent',
            unitsNeeded: 1,
            hospital: 'Teaching Hospital',
            hospitalAddress: 'Lalitpur',
            contactName: 'Hari Karki',
            contactPhone: '+977-9851000000',
            status: 'matching',
            location: { latitude: 27.7352, longitude: 85.332 },
            expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'sample_3',
            patientName: 'Prakash Thapa',
            bloodType: 'B+',
            urgencyLevel: 'standard',
            unitsNeeded: 3,
            hospital: 'Civil Hospital',
            hospitalAddress: 'Bhaktapur',
            contactName: 'Sita Thapa',
            contactPhone: '+977-9861000000',
            status: 'fulfilled',
            location: { latitude: 27.6852, longitude: 85.322 },
            expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
          }
        ];
      }

      const requestsData = snapshot.val();
      return Object.keys(requestsData).map(key => ({
        id: key,
        ...requestsData[key]
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      // Return sample data as fallback
      console.log('Database error, returning sample requests as fallback');
      const now = new Date();
      return [
        {
          id: 'sample_1',
          patientName: 'Emergency Request',
          bloodType: 'O-',
          urgencyLevel: 'critical',
          unitsNeeded: 2,
          hospital: 'Bir Hospital',
          hospitalAddress: 'Kathmandu',
          contactName: 'Contact',
          contactPhone: '+977-9841000000',
          status: 'pending',
          location: { latitude: 27.7052, longitude: 85.312 },
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_2',
          patientName: 'Donor Match',
          bloodType: 'A+',
          urgencyLevel: 'urgent',
          unitsNeeded: 1,
          hospital: 'Teaching Hospital',
          hospitalAddress: 'Lalitpur',
          contactName: 'Contact',
          contactPhone: '+977-9851000000',
          status: 'matching',
          location: { latitude: 27.7352, longitude: 85.332 },
          expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sample_3',
          patientName: 'Request Fulfilled',
          bloodType: 'B+',
          urgencyLevel: 'standard',
          unitsNeeded: 3,
          hospital: 'Civil Hospital',
          hospitalAddress: 'Bhaktapur',
          contactName: 'Contact',
          contactPhone: '+977-9861000000',
          status: 'fulfilled',
          location: { latitude: 27.6852, longitude: 85.322 },
          expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  },

  // Create new emergency request
  async createEmergencyRequest(requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyRequest> {
    const now = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const emergencyRequest: EmergencyRequest = {
      id: requestId,
      ...requestData,
      createdAt: now,
      updatedAt: now
    };

    // Try Firebase first
    try {
      if (database) {
        const requestsRef = ref(database, 'emergencyRequests');
        const newRequestRef = push(requestsRef);
        emergencyRequest.id = newRequestRef.key!;
        await set(newRequestRef, emergencyRequest);
        console.log('Emergency request saved to Firebase:', emergencyRequest.id);
        return emergencyRequest;
      }
    } catch (firebaseError) {
      console.warn('Firebase write failed, trying local storage:', firebaseError);
    }

    // Fallback: Store in localStorage for demo mode
    try {
      const storedRequests = JSON.parse(localStorage.getItem('emergency_requests') || '[]');
      storedRequests.push(emergencyRequest);
      localStorage.setItem('emergency_requests', JSON.stringify(storedRequests));
      console.log('Emergency request saved to localStorage (demo mode):', emergencyRequest.id);
      return emergencyRequest;
    } catch (localError) {
      console.error('Failed to save emergency request:', localError);
      throw new Error('Failed to create emergency request');
    }
  },
  // Update emergency request
  async updateEmergencyRequest(requestId: string, updates: Partial<EmergencyRequest>): Promise<void> {
    try {
      const requestRef = ref(database, `emergencyRequests/${requestId}`);
      await update(requestRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating emergency request:', error);
      throw new Error('Failed to update emergency request');
    }
  },

  // Get active emergency requests
  async getActiveEmergencyRequests(): Promise<EmergencyRequest[]> {
    try {
      const allRequests = await this.getEmergencyRequests();
      const now = new Date();

      return allRequests.filter(request => {
        const expiresAt = new Date(request.expiresAt);
        return expiresAt > now && ['pending', 'matching'].includes(request.status);
      });
    } catch (error) {
      console.error('Error fetching active emergency requests:', error);
      throw new Error('Failed to fetch active emergency requests');
    }
  }
};
// ==== Blood Inventory API ====
export const inventoryAPI = {
  // Get blood inventory
  async getBloodInventory(): Promise<BloodInventoryItem[]> {
    try {
      const inventoryRef = ref(database, 'bloodInventory');
      const snapshot = await get(inventoryRef);

      if (!snapshot.exists()) {
        // Create sample inventory data if none exists
        const sampleInventory = [
          { type: 'O+', units: 45, location: 'Kathmandu Medical College', status: 'available' },
          { type: 'O-', units: 12, location: 'Tribhuvan University Teaching Hospital', status: 'low' },
          { type: 'A+', units: 67, location: 'Bir Hospital', status: 'available' },
          { type: 'A-', units: 8, location: 'Grande International Hospital', status: 'critical' },
          { type: 'B+', units: 34, location: 'Nepal Medical College', status: 'available' },
          { type: 'B-', units: 15, location: 'Dhulikhel Hospital', status: 'low' },
          { type: 'AB+', units: 23, location: 'Norvic International Hospital', status: 'available' },
          { type: 'AB-', units: 5, location: 'Om Hospital', status: 'critical' }
        ].map((item, index) => ({
          id: `inventory_${index + 1}`,
          ...item,
          lastUpdated: new Date().toISOString()
        }));

        // Save sample data
        for (const item of sampleInventory) {
          const itemRef = ref(database, `bloodInventory/${item.id}`);
          await set(itemRef, item);
        }

        return sampleInventory;
      }

      const inventoryData = snapshot.val();
      return Object.keys(inventoryData).map(key => ({
        id: key,
        ...inventoryData[key]
      }));
    } catch (error) {
      console.error('Error fetching blood inventory:', error);
      throw new Error('Failed to fetch blood inventory');
    }
  },
  // Update inventory
  async updateInventory(itemId: string, units: number): Promise<void> {
    try {
      const itemRef = ref(database, `bloodInventory/${itemId}`);
      const status = units < 10 ? 'critical' : units < 25 ? 'low' : 'available';

      await update(itemRef, {
        units,
        status,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error('Failed to update inventory');
    }
  }
};

// ==== Contact API ====
export const contactAPI = {
  // Contact a donor
  async contactDonor(donorId: string, contactType: string, message?: string): Promise<ContactRequest> {
    try {
      const contactRef = ref(database, 'contactRequests');
      const newContactRef = push(contactRef);

      const contactRequest: ContactRequest = {
        id: newContactRef.key!,
        donorId,
        contactType: contactType as ContactRequest['contactType'],
        message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await set(newContactRef, contactRequest);

      // In a real app, this would trigger notifications, emails, SMS, etc.
      console.log(`Contact request sent to donor ${donorId}:`, contactRequest);

      return contactRequest;
    } catch (error) {
      console.error('Error contacting donor:', error);
      throw new Error('Failed to contact donor');
    }
  }
};
// ==== Statistics API ====
export const statsAPI = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [allDonors, emergencyRequests, bloodInventory] = await Promise.all([
        donorAPI.getAllDonors(),
        bloodRequestAPI.getEmergencyRequests(),
        inventoryAPI.getBloodInventory()
      ]);

      const activeDonors = allDonors.filter(donor => donor.status === 'available').length;
      const pendingRequests = emergencyRequests.filter(req => req.status === 'pending').length;
      const totalBloodUnits = bloodInventory.reduce((sum, item) => sum + item.units, 0);
      const activeEmergencyRequests = emergencyRequests.filter(req =>
        ['pending', 'matching'].includes(req.status) &&
        new Date(req.expiresAt) > new Date()
      ).length;

      const moderators = allDonors.filter(user => user.role === 'moderator' || user.isAdmin).length;

      return {
        totalUsers: allDonors.length,
        activeDonors,
        pendingRequests,
        bloodUnits: totalBloodUnits,
        emergencyRequests: activeEmergencyRequests,
        moderators,
        growth: {
          users: 8.5,
          donors: 12.3,
          requests: -3.2
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }
};
// ==== Real-time API ====
export const realtimeAPI = {
  // Subscribe to emergency requests changes
  subscribeToEmergencyRequests(callback: (requests: EmergencyRequest[]) => void): () => void {
    const requestsRef = ref(database, 'emergencyRequests');

    const handleChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        const requests = Object.keys(requestsData).map(key => ({
          id: key,
          ...requestsData[key]
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        callback(requests);
      } else {
        callback([]);
      }
    };

    onValue(requestsRef, handleChange);

    return () => off(requestsRef, 'value', handleChange);
  },

  // Subscribe to donors changes
  subscribeToDonors(callback: (donors: Donor[]) => void): () => void {
    const donorsRef = query(ref(database, 'users'), orderByChild('role'), equalTo('donor'));

    const handleChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const donorsData = snapshot.val();
        const donors = Object.keys(donorsData).map(key => ({
          id: key,
          ...donorsData[key]
        }));

        callback(addLocationData(donors));
      } else {
        callback([]);
      }
    };

    onValue(donorsRef, handleChange);

    return () => off(donorsRef, 'value', handleChange);
  },
  // Subscribe to blood inventory changes
  subscribeToInventory(callback: (inventory: BloodInventoryItem[]) => void): () => void {
    const inventoryRef = ref(database, 'bloodInventory');

    const handleChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const inventoryData = snapshot.val();
        const inventory = Object.keys(inventoryData).map(key => ({
          id: key,
          ...inventoryData[key]
        }));

        callback(inventory);
      } else {
        callback([]);
      }
    };

    onValue(inventoryRef, handleChange);

    return () => off(inventoryRef, 'value', handleChange);
  }
};

// ==== Authentication helpers ====
export const authAPI = {
  // Get current user
  getCurrentUser: () => auth.currentUser,

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Create new user
  createUser: async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign out
  signOut: async () => {
    return await signOut(auth);
  }
};

export default {
  donorAPI,
  bloodRequestAPI,
  inventoryAPI,
  contactAPI,
  statsAPI,
  realtimeAPI,
  authAPI
};