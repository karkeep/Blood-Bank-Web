import { z } from 'zod';

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  bloodType: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'volunteer' | 'donor' | 'user';
  firebaseUid?: string;
  fullName?: string;
  isAdmin?: boolean;
  createdBy?: number; // ID of the user who created this account
  status?: 'active' | 'suspended' | 'banned'; // User account status
  suspension?: {
    until?: Date;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type DonorProfile = {
  id: number;
  userId: number;
  status: string;
  badge: string;
  totalDonations: number;
  litersDonated: number;
  livesSaved: number;
  verificationStatus: string;
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
};

export type EmergencyRequest = {
  id: number;
  requesterId: number | null;
  contactName: string;
  bloodType: string;
  urgencyLevel: string;
  contactPhone: string;
  contactEmail?: string;
  hospitalName?: string;
  details?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DonationRecord = {
  id: number;
  donorId: number;
  bloodType: string;
  donationDate: string;
  volume: number;
  location: string;
  donationCenter: string;
};

export type Document = {
  id: number;
  userId: number;
  type: string;
  fileName: string;
  filePath: string;
  verificationStatus: string;
  notes: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
};

// Deletion request type
export type DeletionRequest = {
  id: number;
  requesterId: number;
  targetUserId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
};

export type BloodBank = {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  inventoryLevels?: {
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
    'O+': number;
    'O-': number;
  };
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
};

// Adding placeholder types for database schema objects
export const users = {};
export const donorProfiles = {};
export const emergencyRequests = {};
export const donationRecords = {};
export const documents = {};
export const deletionRequests = {};
export const bloodBanks = {};

// Adding placeholder insertion types
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertDonorProfile = Omit<DonorProfile, 'id'>;
export type InsertEmergencyRequest = Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertDonationRecord = Omit<DonationRecord, 'id'>;
export type InsertDocument = Omit<Document, 'id' | 'uploadedAt' | 'verifiedAt'>;
export type InsertDeletionRequest = Omit<DeletionRequest, 'id' | 'resolvedAt'>;
export type InsertBloodBank = Omit<BloodBank, 'id' | 'createdAt' | 'updatedAt'>;

// Zod schemas for validation
export const insertEmergencyRequestSchema = z.object({
  requesterId: z.number().nullable(),
  contactName: z.string().min(1, "Contact name is required"),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  urgencyLevel: z.enum(["critical", "urgent", "standard"]),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email().optional(),
  hospitalName: z.string().optional(),
  details: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }),
  status: z.enum(["Pending", "Matching", "Fulfilled", "Expired", "Cancelled"]).default("Pending"),
  expiresAt: z.date()
});

export const insertDocumentSchema = z.object({
  userId: z.number(),
  type: z.enum(["ID", "MedicalReport", "DonorCard", "AddressProof", "Other"]),
  fileName: z.string(),
  filePath: z.string(),
  verificationStatus: z.enum(["Pending", "Verified", "Rejected"]).default("Pending"),
  notes: z.string().nullable().optional()
});
