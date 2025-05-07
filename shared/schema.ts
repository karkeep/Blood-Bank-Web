import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum types as string literals
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const userRoles = ['donor', 'requester', 'admin'] as const;
const donorBadges = ['Bronze', 'Silver', 'Gold'] as const;
const donorStatuses = ['Available', 'Unavailable', 'Pending'] as const;
const verificationStatuses = ['Unverified', 'Pending', 'Verified'] as const;
const requestStatuses = ['Pending', 'Matching', 'Donor Found', 'Fulfilled', 'Cancelled'] as const;
const urgencyLevels = ['Standard', 'Urgent', 'Critical'] as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  bloodType: text("blood_type").notNull().$type<typeof bloodTypes[number]>(),
  role: text("role").notNull().default('donor').$type<typeof userRoles[number]>(),
  isAdmin: boolean("is_admin").notNull().default(false),
  location: jsonb("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Donor profiles table
export const donorProfiles = pgTable("donor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default('Pending').$type<typeof donorStatuses[number]>(),
  badge: text("badge").notNull().default('Bronze').$type<typeof donorBadges[number]>(),
  totalDonations: integer("total_donations").notNull().default(0),
  litersDonated: integer("liters_donated").notNull().default(0),
  livesSaved: integer("lives_saved").notNull().default(0),
  lastDonationDate: timestamp("last_donation_date"),
  nextEligibleDate: timestamp("next_eligible_date"),
  medicalInfo: jsonb("medical_info"),
  verificationStatus: text("verification_status").notNull().default('Unverified').$type<typeof verificationStatuses[number]>(),
  documents: jsonb("documents"),
}, (table) => {
  return {
    userIdx: unique().on(table.userId),
  }
});

// Emergency requests table
export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  patientName: text("patient_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  bloodType: text("blood_type").notNull().$type<typeof bloodTypes[number]>(),
  unitsNeeded: integer("units_needed").notNull().default(1),
  hospitalName: text("hospital_name").notNull(),
  hospitalAddress: text("hospital_address").notNull(),
  location: jsonb("location").notNull(),
  urgencyLevel: text("urgency_level").notNull().default('Urgent').$type<typeof urgencyLevels[number]>(),
  medicalReason: text("medical_reason").notNull(),
  status: text("status").notNull().default('Pending').$type<typeof requestStatuses[number]>(),
  matchedDonorIds: jsonb("matched_donor_ids"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Donation records table
export const donationRecords = pgTable("donation_records", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => users.id),
  requestId: integer("request_id").references(() => emergencyRequests.id),
  bloodType: text("blood_type").notNull().$type<typeof bloodTypes[number]>(),
  volume: integer("volume").notNull(), // in ml
  donationDate: timestamp("donation_date").notNull().defaultNow(),
  hospitalName: text("hospital_name").notNull(),
  hospitalAddress: text("hospital_address"),
  isEmergency: boolean("is_emergency").notNull().default(false),
  recipientNote: text("recipient_note"),
});

// Documents table for KYC
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  verificationStatus: text("verification_status").notNull().default('Pending').$type<typeof verificationStatuses[number]>(),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Zod schemas for data validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDonorProfileSchema = createInsertSchema(donorProfiles).omit({ id: true });
export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDonationRecordSchema = createInsertSchema(donationRecords).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true, verifiedAt: true });

// Define common types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDonorProfile = z.infer<typeof insertDonorProfileSchema>;
export type DonorProfile = typeof donorProfiles.$inferSelect;

export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;

export type InsertDonationRecord = z.infer<typeof insertDonationRecordSchema>;
export type DonationRecord = typeof donationRecords.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
