// User Types
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserRole = 'donor' | 'requester' | 'admin';
export type DonorBadge = 'Bronze' | 'Silver' | 'Gold';
export type DonorStatus = 'Available' | 'Unavailable' | 'Pending';
export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  bloodType: BloodType;
  role: UserRole;
  isAdmin: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  donorProfile?: DonorProfile;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfile {
  userId: number;
  status: DonorStatus;
  badge: DonorBadge;
  totalDonations: number;
  litersDonated: number;
  livesSaved: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  medicalInfo?: {
    healthConditions?: string[];
    medications?: string[];
    allergies?: string[];
    hemoglobin?: number;
    bloodPressure?: string;
  };
  verificationStatus: VerificationStatus;
  documents?: {
    idFront?: string;
    idBack?: string;
    selfie?: string;
    medicalCertificate?: string;
  };
}

// Emergency Request Types
export type RequestStatus = 'Pending' | 'Matching' | 'Donor Found' | 'Fulfilled' | 'Cancelled';
export type UrgencyLevel = 'Standard' | 'Urgent' | 'Critical';

export interface EmergencyRequest {
  id: number;
  requesterId: number;
  patientName: string;
  contactName: string;
  contactPhone: string;
  bloodType: BloodType;
  unitsNeeded: number;
  hospitalName: string;
  hospitalAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  urgencyLevel: UrgencyLevel;
  medicalReason: string;
  status: RequestStatus;
  matchedDonorIds?: number[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// Donation Record Types
export interface DonationRecord {
  id: number;
  donorId: number;
  requestId?: number;
  bloodType: BloodType;
  volume: number; // in ml
  donationDate: string;
  hospitalName: string;
  hospitalAddress?: string;
  isEmergency: boolean;
  recipientNote?: string;
}

// Analytics Data Types
export interface CityInventory {
  id: string;
  name: string;
  status: 'Critical' | 'Low' | 'Stable';
  inventoryLevels: {
    type: BloodType;
    percentage: number;
    status?: string;
  }[];
}

export interface DonorCity {
  id: string;
  name: string;
  value: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'match' | 'fulfilled' | 'request';
  message: string;
  timeAgo: string;
}

export interface TopDonor {
  id: string;
  name: string;
  badge: DonorBadge;
  bloodType: BloodType;
  donations: number;
  liters: number;
  livesSaved: number;
}
