/**
 * Firebase to Supabase Data Migration Utility
 * 
 * This script exports data from Firebase Realtime Database
 * and prepares it for import into Supabase.
 * 
 * Usage:
 *   1. Run the export: npx ts-node scripts/migrate-firebase-to-supabase.ts export
 *   2. Review the exported JSON files in ./migration-data/
 *   3. Run the import: npx ts-node scripts/migrate-firebase-to-supabase.ts import
 */

import * as fs from 'fs';
import * as path from 'path';

// Firebase Admin SDK imports (use your existing credentials)
// import * as admin from 'firebase-admin';

// Supabase client
// import { createClient } from '@supabase/supabase-js';

interface MigrationConfig {
    outputDir: string;
    tables: TableMapping[];
}

interface TableMapping {
    firebasePath: string;
    supabaseTable: string;
    transform: (data: Record<string, unknown>) => Record<string, unknown>;
}

// Type definitions for Firebase data
interface FirebaseUser {
    email: string;
    displayName?: string;
    role: string;
    bloodType?: string;
    phone?: string;
    city?: string;
    state?: string;
    createdAt: string;
    lastLoginAt?: string;
    isAdmin?: boolean;
    profileImage?: string;
}

interface FirebaseDonorProfile {
    userId: string;
    bloodType: string;
    totalDonations: number;
    lastDonationDate?: string;
    weight?: number;
    medicalConditions?: string[];
    isAvailable: boolean;
    verificationStatus: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
}

interface FirebaseEmergencyRequest {
    requesterId: string;
    patientName: string;
    bloodType: string;
    unitsNeeded: number;
    urgency: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalCity: string;
    hospitalState?: string;
    contactName: string;
    contactPhone: string;
    contactRelation: string;
    status: string;
    requestReason?: string;
    notes?: string;
    createdAt: string;
    expiresAt?: string;
}

const config: MigrationConfig = {
    outputDir: './migration-data',
    tables: [
        {
            firebasePath: 'users',
            supabaseTable: 'users',
            transform: (data: Record<string, unknown>) => {
                const fbUser = data as unknown as FirebaseUser;
                return {
                    // Map Firebase user to Supabase user schema
                    email: fbUser.email,
                    full_name: fbUser.displayName || null,
                    phone: fbUser.phone || null,
                    blood_type: mapBloodType(fbUser.bloodType),
                    city: fbUser.city || null,
                    state: fbUser.state || null,
                    avatar_url: fbUser.profileImage || null,
                    is_active: true,
                    email_verified: true,
                    created_at: new Date(fbUser.createdAt).toISOString(),
                    updated_at: new Date().toISOString(),
                };
            },
        },
        {
            firebasePath: 'donorProfiles',
            supabaseTable: 'donor_profiles',
            transform: (data: Record<string, unknown>) => {
                const fbDonor = data as unknown as FirebaseDonorProfile;
                return {
                    // Map Firebase donor profile to Supabase schema
                    blood_type: mapBloodType(fbDonor.bloodType),
                    total_donations: fbDonor.totalDonations || 0,
                    last_donation_date: fbDonor.lastDonationDate ? new Date(fbDonor.lastDonationDate).toISOString() : null,
                    weight_kg: fbDonor.weight || null,
                    is_available: fbDonor.isAvailable ?? true,
                    verification_status: mapVerificationStatus(fbDonor.verificationStatus),
                    city: fbDonor.city || null,
                    state: fbDonor.state || null,
                    latitude: fbDonor.latitude || null,
                    longitude: fbDonor.longitude || null,
                    health_conditions: fbDonor.medicalConditions || [],
                };
            },
        },
        {
            firebasePath: 'emergencyRequests',
            supabaseTable: 'emergency_requests',
            transform: (data: Record<string, unknown>) => {
                const fbRequest = data as unknown as FirebaseEmergencyRequest;
                return {
                    // Map Firebase emergency request to Supabase schema
                    patient_name: fbRequest.patientName,
                    blood_type: mapBloodType(fbRequest.bloodType),
                    units_needed: fbRequest.unitsNeeded,
                    urgency: mapUrgency(fbRequest.urgency),
                    hospital_name: fbRequest.hospitalName,
                    hospital_address: fbRequest.hospitalAddress,
                    hospital_city: fbRequest.hospitalCity,
                    hospital_state: fbRequest.hospitalState || 'Bagmati',
                    contact_name: fbRequest.contactName,
                    contact_phone: fbRequest.contactPhone,
                    contact_relation: fbRequest.contactRelation,
                    status: mapRequestStatus(fbRequest.status),
                    request_reason: fbRequest.requestReason || 'Medical emergency',
                    notes: fbRequest.notes || null,
                    created_at: new Date(fbRequest.createdAt).toISOString(),
                    expires_at: fbRequest.expiresAt ? new Date(fbRequest.expiresAt).toISOString() :
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
                };
            },
        },
    ],
};

// Helper functions to map Firebase values to Supabase enums
function mapBloodType(fbType?: string): string | null {
    if (!fbType) return null;
    const mapping: Record<string, string> = {
        'A+': 'A+', 'A-': 'A-',
        'B+': 'B+', 'B-': 'B-',
        'AB+': 'AB+', 'AB-': 'AB-',
        'O+': 'O+', 'O-': 'O-',
        'Apos': 'A+', 'Aneg': 'A-',
        'Bpos': 'B+', 'Bneg': 'B-',
        'ABpos': 'AB+', 'ABneg': 'AB-',
        'Opos': 'O+', 'Oneg': 'O-',
    };
    return mapping[fbType] || fbType;
}

function mapVerificationStatus(status?: string): string {
    const mapping: Record<string, string> = {
        'Pending': 'pending',
        'Verified': 'verified',
        'Rejected': 'rejected',
        'pending': 'pending',
        'verified': 'verified',
        'rejected': 'rejected',
    };
    return mapping[status || 'pending'] || 'pending';
}

function mapUrgency(urgency?: string): string {
    const mapping: Record<string, string> = {
        'Critical': 'critical',
        'Urgent': 'urgent',
        'Normal': 'normal',
        'Low': 'low',
        'life_threatening': 'life_threatening',
    };
    return mapping[urgency || 'normal'] || 'normal';
}

function mapRequestStatus(status?: string): string {
    const mapping: Record<string, string> = {
        'Pending': 'pending',
        'Active': 'pending',
        'Matching': 'matching',
        'Donors_Found': 'donors_found',
        'Fulfilled': 'fulfilled',
        'Cancelled': 'cancelled',
        'Expired': 'expired',
    };
    return mapping[status || 'pending'] || 'pending';
}

// Export function (mock implementation - would use Firebase Admin SDK)
async function exportFromFirebase(): Promise<void> {
    console.log('📦 Starting Firebase data export...');

    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // In production, you would use:
    // const db = admin.database();
    // const snapshot = await db.ref(tablePath).once('value');
    // const data = snapshot.val();

    console.log(`\n📁 Export directory: ${config.outputDir}`);
    console.log('\n⚠️  This is a template script. To use:');
    console.log('   1. Uncomment the Firebase Admin SDK imports');
    console.log('   2. Initialize Firebase Admin with your credentials');
    console.log('   3. Replace the mock data fetching with actual Firebase queries');

    console.log('\n✅ Firebase export template ready!');
}

// Import function (mock implementation - would use Supabase client)
async function importToSupabase(): Promise<void> {
    console.log('📦 Starting Supabase data import...');

    // In production, you would use:
    // const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // await supabase.from(table).upsert(transformedData);

    console.log('\n⚠️  This is a template script. To use:');
    console.log('   1. Uncomment the Supabase client imports');
    console.log('   2. Set your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('   3. Run the import after reviewing the exported JSON files');

    console.log('\n✅ Supabase import template ready!');
}

// Main CLI handler
async function main(): Promise<void> {
    const command = process.argv[2];

    console.log('🔄 Firebase to Supabase Migration Utility\n');

    switch (command) {
        case 'export':
            await exportFromFirebase();
            break;
        case 'import':
            await importToSupabase();
            break;
        default:
            console.log('Usage:');
            console.log('  npx ts-node scripts/migrate-firebase-to-supabase.ts export');
            console.log('  npx ts-node scripts/migrate-firebase-to-supabase.ts import');
            console.log('\nCommands:');
            console.log('  export  - Export data from Firebase to JSON files');
            console.log('  import  - Import JSON files to Supabase');
    }
}

main().catch(console.error);

// Export types and functions for use in other scripts
export { config, mapBloodType, mapVerificationStatus, mapUrgency, mapRequestStatus };
export type { MigrationConfig, TableMapping };
