/**
 * Donor Verification Hook
 * Handles all verification-related database operations
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// Types
// ============================================

export type VerificationStep = 'identity' | 'medical' | 'location' | 'complete';

export interface VerificationStatus {
    identityVerified: boolean;
    medicalVerified: boolean;
    locationVerified: boolean;
    overallStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
    completedSteps: number;
    totalSteps: number;
}

export interface IdentityData {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    idType: 'citizenship' | 'passport' | 'license' | 'voter_id';
    idNumber: string;
    idPhotoUrl?: string;
    selfieUrl?: string;
}

export interface MedicalData {
    bloodType: string;
    weight: number;
    height: number;
    hemoglobinLevel?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    medicalConditions: string[];
    medications: string[];
    allergies: string[];
    lastDonationDate?: string;
    hasRecentSurgery: boolean;
    recentSurgeryDetails?: string;
    isPregnant?: boolean;
    hasChronicDisease: boolean;
    chronicDiseaseDetails?: string;
    hasTattooOrPiercing: boolean;
    tattooDate?: string;
    hasRecentTravel: boolean;
    travelDetails?: string;
}

export interface LocationData {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    travelRadius: number;
    transportationNeeded: boolean;
    emergencyAvailable: boolean;
    preferredDonationCenters?: string[];
}

export interface VerificationSubmission {
    identity: IdentityData;
    medical: MedicalData;
    location: LocationData;
}

// ============================================
// Hook
// ============================================

export function useDonorVerification() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<VerificationStep>('identity');
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
        identityVerified: false,
        medicalVerified: false,
        locationVerified: false,
        overallStatus: 'unverified',
        completedSteps: 0,
        totalSteps: 3,
    });

    // Check current verification status
    const checkVerificationStatus = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            if (!supabase) {
                return verificationStatus;
            }

            const { data, error: dbError } = await supabase
                .from('donor_profiles')
                .select('verification_status, latitude, longitude, city')
                .eq('user_id', userId)
                .single();

            if (dbError) throw dbError;

            // Check health records
            const { data: healthData } = await supabase
                .from('donor_health_records')
                .select('checkup_status')
                .eq('donor_profile_id', data?.id)
                .single();

            const status: VerificationStatus = {
                identityVerified: data?.verification_status !== 'unverified',
                medicalVerified: healthData?.checkup_status === 'verified',
                locationVerified: !!(data?.latitude && data?.longitude),
                overallStatus: data?.verification_status || 'unverified',
                completedSteps: 0,
                totalSteps: 3,
            };

            if (status.identityVerified) status.completedSteps++;
            if (status.medicalVerified) status.completedSteps++;
            if (status.locationVerified) status.completedSteps++;

            setVerificationStatus(status);
            return status;
        } catch (err: any) {
            setError(err.message);
            return verificationStatus;
        } finally {
            setIsLoading(false);
        }
    }, [verificationStatus]);

    // Submit identity verification
    const submitIdentity = useCallback(async (userId: string, data: IdentityData) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!supabase) {
                // Mock success for development
                setVerificationStatus(prev => ({
                    ...prev,
                    identityVerified: true,
                    completedSteps: prev.completedSteps + 1,
                }));
                setCurrentStep('medical');
                return { success: true };
            }

            // Update user profile with identity data
            const { error: userError } = await supabase
                .from('users')
                .update({
                    full_name: data.fullName,
                    date_of_birth: data.dateOfBirth,
                    gender: data.gender,
                    id_type: data.idType,
                    id_number: data.idNumber,
                    id_verified_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (userError) throw userError;

            // Update donor profile verification status
            const { error: profileError } = await supabase
                .from('donor_profiles')
                .update({
                    verification_status: 'pending',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (profileError) throw profileError;

            setVerificationStatus(prev => ({
                ...prev,
                identityVerified: true,
                overallStatus: 'pending',
                completedSteps: prev.completedSteps + 1,
            }));
            setCurrentStep('medical');
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Submit medical information
    const submitMedical = useCallback(async (userId: string, data: MedicalData) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!supabase) {
                setVerificationStatus(prev => ({
                    ...prev,
                    medicalVerified: true,
                    completedSteps: prev.completedSteps + 1,
                }));
                setCurrentStep('location');
                return { success: true };
            }

            // Get donor profile ID
            const { data: profile } = await supabase
                .from('donor_profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (!profile) {
                // Create donor profile if doesn't exist
                const { data: newProfile, error: createError } = await supabase
                    .from('donor_profiles')
                    .insert({ user_id: userId })
                    .select('id')
                    .single();

                if (createError) throw createError;
                profile.id = newProfile.id;
            }

            // Update blood type on user
            await supabase
                .from('users')
                .update({ blood_type: data.bloodType })
                .eq('id', userId);

            // Upsert health records
            const { error: healthError } = await supabase
                .from('donor_health_records')
                .upsert({
                    donor_profile_id: profile.id,
                    weight_kg: data.weight,
                    height_cm: data.height,
                    hemoglobin_level: data.hemoglobinLevel,
                    blood_pressure_systolic: data.bloodPressureSystolic,
                    blood_pressure_diastolic: data.bloodPressureDiastolic,
                    medical_conditions: data.medicalConditions,
                    medications: data.medications,
                    allergies: data.allergies,
                    checkup_status: 'pending',
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'donor_profile_id',
                });

            if (healthError) throw healthError;

            setVerificationStatus(prev => ({
                ...prev,
                medicalVerified: true,
                completedSteps: prev.completedSteps + 1,
            }));
            setCurrentStep('location');
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Submit location information
    const submitLocation = useCallback(async (userId: string, data: LocationData) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!supabase) {
                setVerificationStatus(prev => ({
                    ...prev,
                    locationVerified: true,
                    overallStatus: 'pending',
                    completedSteps: 3,
                }));
                setCurrentStep('complete');
                return { success: true };
            }

            // Update donor profile with location
            const { error: profileError } = await supabase
                .from('donor_profiles')
                .update({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    travel_radius_km: data.travelRadius,
                    transportation_needed: data.transportationNeeded,
                    emergency_available: data.emergencyAvailable,
                    verification_status: 'pending',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (profileError) throw profileError;

            setVerificationStatus(prev => ({
                ...prev,
                locationVerified: true,
                overallStatus: 'pending',
                completedSteps: 3,
            }));
            setCurrentStep('complete');
            return { success: true };
        } catch (err: any) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset verification process
    const resetVerification = useCallback(() => {
        setCurrentStep('identity');
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        currentStep,
        setCurrentStep,
        verificationStatus,
        checkVerificationStatus,
        submitIdentity,
        submitMedical,
        submitLocation,
        resetVerification,
    };
}

export default useDonorVerification;
