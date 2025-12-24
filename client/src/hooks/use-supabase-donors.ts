/**
 * Supabase-powered hook for fetching and managing donors
 * Works alongside Firebase during the migration period
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

// Type aliases from the database
type DonorProfile = Database['public']['Tables']['donor_profiles']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

// Extended donor type with user info
export interface SupabaseDonor {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    bloodType: string;

    // Location
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    distance?: number;

    // Donation stats
    totalDonations: number;
    litersD: number;
    livesSaved: number;
    donationStreak: number;

    // Eligibility
    lastDonationDate: string | null;
    nextEligibleDate: string | null;
    eligibilityStatus: string;
    isAvailable: boolean;
    emergencyAvailable: boolean;

    // Verification
    verificationStatus: string;

    // Gamification
    badge: string;
    points: number;

    // ML Scores
    reliabilityScore: number;
    responseRate: number;
    churnRiskScore: number;
}

interface UseSupabaseDonorsOptions {
    bloodType?: string;
    city?: string;
    minReliabilityScore?: number;
    maxDistance?: number;
    availableOnly?: boolean;
    verifiedOnly?: boolean;
    limit?: number;
    enableRealtime?: boolean;
}

interface UseSupabaseDonorsResult {
    donors: SupabaseDonor[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
    refetch: () => Promise<void>;
    // Actions
    toggleAvailability: (donorId: string, available: boolean) => Promise<void>;
    updateDonorProfile: (donorId: string, data: Partial<DonorProfile>) => Promise<void>;
}

// Mock data for fallback when Supabase is not connected
const MOCK_DONORS: SupabaseDonor[] = [
    {
        id: 'mock-1',
        userId: 'user-1',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '+977-980-1234567',
        avatarUrl: null,
        bloodType: 'O-',
        latitude: 27.7172,
        longitude: 85.3240,
        city: 'Kathmandu',
        distance: 0.5,
        totalDonations: 12,
        litersD: 5.4,
        livesSaved: 36,
        donationStreak: 8,
        lastDonationDate: '2024-10-15',
        nextEligibleDate: '2024-12-10',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'gold',
        points: 1250,
        reliabilityScore: 0.95,
        responseRate: 0.88,
        churnRiskScore: 0.12,
    },
    {
        id: 'mock-2',
        userId: 'user-2',
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '+977-980-2345678',
        avatarUrl: null,
        bloodType: 'A+',
        latitude: 27.7271,
        longitude: 85.3100,
        city: 'Kathmandu',
        distance: 1.2,
        totalDonations: 8,
        litersD: 3.6,
        livesSaved: 24,
        donationStreak: 5,
        lastDonationDate: '2024-09-20',
        nextEligibleDate: '2024-11-15',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'silver',
        points: 850,
        reliabilityScore: 0.92,
        responseRate: 0.85,
        churnRiskScore: 0.15,
    },
    {
        id: 'mock-3',
        userId: 'user-3',
        name: 'Rahul Thapa',
        email: 'rahul@example.com',
        phone: '+977-980-3456789',
        avatarUrl: null,
        bloodType: 'B+',
        latitude: 27.7350,
        longitude: 85.3170,
        city: 'Bhaktapur',
        distance: 2.1,
        totalDonations: 5,
        litersD: 2.25,
        livesSaved: 15,
        donationStreak: 3,
        lastDonationDate: '2024-08-10',
        nextEligibleDate: '2024-10-05',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: false,
        verificationStatus: 'verified',
        badge: 'silver',
        points: 520,
        reliabilityScore: 0.78,
        responseRate: 0.70,
        churnRiskScore: 0.25,
    },
    {
        id: 'mock-4',
        userId: 'user-4',
        name: 'Sita Gurung',
        email: 'sita@example.com',
        phone: '+977-980-4567890',
        avatarUrl: null,
        bloodType: 'AB+',
        latitude: 27.7155,
        longitude: 85.3380,
        city: 'Lalitpur',
        distance: 1.5,
        totalDonations: 6,
        litersD: 2.7,
        livesSaved: 18,
        donationStreak: 4,
        lastDonationDate: '2024-10-01',
        nextEligibleDate: '2024-11-26',
        eligibilityStatus: 'eligible',
        isAvailable: false,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'silver',
        points: 680,
        reliabilityScore: 0.88,
        responseRate: 0.82,
        churnRiskScore: 0.18,
    },
    {
        id: 'mock-5',
        userId: 'user-5',
        name: 'Bikash Adhikari',
        email: 'bikash@example.com',
        phone: '+977-980-5678901',
        avatarUrl: null,
        bloodType: 'O+',
        latitude: 27.7080,
        longitude: 85.3200,
        city: 'Kathmandu',
        distance: 0.9,
        totalDonations: 15,
        litersD: 6.75,
        livesSaved: 45,
        donationStreak: 12,
        lastDonationDate: '2024-10-20',
        nextEligibleDate: '2024-12-15',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'platinum',
        points: 1850,
        reliabilityScore: 0.98,
        responseRate: 0.95,
        churnRiskScore: 0.08,
    },
    {
        id: 'mock-6',
        userId: 'user-6',
        name: 'Maya Rai',
        email: 'maya@example.com',
        phone: '+977-980-6789012',
        avatarUrl: null,
        bloodType: 'A-',
        latitude: 27.7250,
        longitude: 85.3300,
        city: 'Kathmandu',
        distance: 1.8,
        totalDonations: 10,
        litersD: 4.5,
        livesSaved: 30,
        donationStreak: 7,
        lastDonationDate: '2024-09-15',
        nextEligibleDate: '2024-11-10',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'gold',
        points: 1100,
        reliabilityScore: 0.91,
        responseRate: 0.86,
        churnRiskScore: 0.14,
    },
    {
        id: 'mock-7',
        userId: 'user-7',
        name: 'Deepak Shrestha',
        email: 'deepak@example.com',
        phone: '+977-980-7890123',
        avatarUrl: null,
        bloodType: 'B-',
        latitude: 27.7150,
        longitude: 85.3100,
        city: 'Kathmandu',
        distance: 0.7,
        totalDonations: 3,
        litersD: 1.35,
        livesSaved: 9,
        donationStreak: 2,
        lastDonationDate: '2024-07-25',
        nextEligibleDate: '2024-09-19',
        eligibilityStatus: 'pending',
        isAvailable: true,
        emergencyAvailable: false,
        verificationStatus: 'pending',
        badge: 'bronze',
        points: 280,
        reliabilityScore: 0.65,
        responseRate: 0.60,
        churnRiskScore: 0.35,
    },
    {
        id: 'mock-8',
        userId: 'user-8',
        name: 'Anita Tamang',
        email: 'anita@example.com',
        phone: '+977-980-8901234',
        avatarUrl: null,
        bloodType: 'AB-',
        latitude: 27.7200,
        longitude: 85.3350,
        city: 'Lalitpur',
        distance: 1.3,
        totalDonations: 20,
        litersD: 9.0,
        livesSaved: 60,
        donationStreak: 15,
        lastDonationDate: '2024-10-25',
        nextEligibleDate: '2024-12-20',
        eligibilityStatus: 'eligible',
        isAvailable: true,
        emergencyAvailable: true,
        verificationStatus: 'verified',
        badge: 'diamond',
        points: 2500,
        reliabilityScore: 0.99,
        responseRate: 0.97,
        churnRiskScore: 0.05,
    },
];

export function useSupabaseDonors(options: UseSupabaseDonorsOptions = {}): UseSupabaseDonorsResult {
    const {
        bloodType,
        city,
        minReliabilityScore = 0,
        maxDistance = 50,
        availableOnly = false,
        verifiedOnly = false,
        limit = 50,
        enableRealtime = false,
    } = options;

    const [donors, setDonors] = useState<SupabaseDonor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [usesFallback, setUsesFallback] = useState(false);

    // Fetch donors from Supabase
    const fetchDonors = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build the query
            let query = supabase
                .from('donor_profiles')
                .select(`
          *,
          users!inner(
            id,
            email,
            phone,
            full_name,
            avatar_url,
            blood_type,
            address
          )
        `, { count: 'exact' })
                .order('reliability_score', { ascending: false })
                .limit(limit);

            // Apply filters
            if (bloodType && bloodType !== 'all') {
                query = query.eq('users.blood_type', bloodType);
            }

            if (availableOnly) {
                query = query.eq('is_available', true);
            }

            if (verifiedOnly) {
                query = query.eq('verification_status', 'verified');
            }

            if (minReliabilityScore > 0) {
                query = query.gte('reliability_score', minReliabilityScore);
            }

            const { data, error: queryError, count } = await query;

            if (queryError) {
                throw queryError;
            }

            if (data && data.length > 0) {
                // Transform the data to our donor format
                const transformedDonors: SupabaseDonor[] = data.map((row: any) => {
                    const user = row.users;
                    const address = user.address as { city?: string } | null;

                    return {
                        id: row.id,
                        userId: row.user_id,
                        name: user.full_name || 'Anonymous Donor',
                        email: user.email,
                        phone: user.phone,
                        avatarUrl: user.avatar_url,
                        bloodType: user.blood_type,
                        latitude: null, // Would come from location geography
                        longitude: null,
                        city: address?.city || null,
                        totalDonations: row.total_donations,
                        litersD: parseFloat(row.liters_donated) || 0,
                        livesSaved: row.lives_saved,
                        donationStreak: row.donation_streak,
                        lastDonationDate: row.last_donation_date,
                        nextEligibleDate: row.next_eligible_date,
                        eligibilityStatus: row.eligibility_status,
                        isAvailable: row.is_available,
                        emergencyAvailable: row.emergency_available,
                        verificationStatus: row.verification_status,
                        badge: row.badge,
                        points: row.points,
                        reliabilityScore: parseFloat(row.reliability_score) || 0.5,
                        responseRate: parseFloat(row.response_rate) || 0.5,
                        churnRiskScore: parseFloat(row.churn_risk_score) || 0.5,
                    };
                });

                // Apply city filter if specified (PostGIS would handle distance)
                let filteredDonors = transformedDonors;
                if (city) {
                    filteredDonors = filteredDonors.filter(d =>
                        d.city?.toLowerCase().includes(city.toLowerCase())
                    );
                }

                setDonors(filteredDonors);
                setTotalCount(count || filteredDonors.length);
                setUsesFallback(false);
            } else {
                // Use mock data as fallback
                console.log('📦 Using mock donor data (Supabase not configured or empty)');
                useFallbackData();
            }
        } catch (err) {
            console.warn('⚠️ Supabase query failed, using fallback data:', err);
            useFallbackData();
        } finally {
            setIsLoading(false);
        }
    }, [bloodType, city, minReliabilityScore, availableOnly, verifiedOnly, limit]);

    // Fallback to mock data
    const useFallbackData = useCallback(() => {
        let filteredDonors = [...MOCK_DONORS];

        if (bloodType && bloodType !== 'all') {
            filteredDonors = filteredDonors.filter(d => d.bloodType === bloodType);
        }
        if (city) {
            filteredDonors = filteredDonors.filter(d =>
                d.city?.toLowerCase().includes(city.toLowerCase())
            );
        }
        if (availableOnly) {
            filteredDonors = filteredDonors.filter(d => d.isAvailable);
        }
        if (verifiedOnly) {
            filteredDonors = filteredDonors.filter(d => d.verificationStatus === 'verified');
        }
        if (minReliabilityScore > 0) {
            filteredDonors = filteredDonors.filter(d => d.reliabilityScore >= minReliabilityScore);
        }
        if (maxDistance) {
            filteredDonors = filteredDonors.filter(d =>
                d.distance !== undefined && d.distance <= maxDistance
            );
        }

        // Sort by reliability
        filteredDonors.sort((a, b) => b.reliabilityScore - a.reliabilityScore);

        setDonors(filteredDonors.slice(0, limit));
        setTotalCount(filteredDonors.length);
        setUsesFallback(true);
        setError(null);
    }, [bloodType, city, availableOnly, verifiedOnly, minReliabilityScore, maxDistance, limit]);

    // Toggle donor availability
    const toggleAvailability = useCallback(async (donorId: string, available: boolean) => {
        if (usesFallback) {
            // Update mock data locally
            setDonors(prev => prev.map(d =>
                d.id === donorId ? { ...d, isAvailable: available } : d
            ));
            return;
        }

        const { error: updateError } = await supabase
            .from('donor_profiles')
            .update({ is_available: available, updated_at: new Date().toISOString() })
            .eq('id', donorId);

        if (updateError) {
            throw new Error(`Failed to update availability: ${updateError.message}`);
        }

        // Optimistic update
        setDonors(prev => prev.map(d =>
            d.id === donorId ? { ...d, isAvailable: available } : d
        ));
    }, [usesFallback]);

    // Update donor profile
    const updateDonorProfile = useCallback(async (donorId: string, data: Partial<DonorProfile>) => {
        if (usesFallback) {
            console.warn('Cannot update donor profile in fallback mode');
            return;
        }

        const { error: updateError } = await supabase
            .from('donor_profiles')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', donorId);

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        // Refetch to get updated data
        await fetchDonors();
    }, [usesFallback, fetchDonors]);

    // Initial fetch
    useEffect(() => {
        fetchDonors();
    }, [fetchDonors]);

    // Real-time subscription
    useEffect(() => {
        if (!enableRealtime || usesFallback) return;

        const unsubscribe = subscribeToTable('donor_profiles', (payload) => {
            console.log('🔄 Donor profile changed:', payload);
            fetchDonors(); // Refetch on changes
        });

        return () => {
            unsubscribe();
        };
    }, [enableRealtime, usesFallback, fetchDonors]);

    return {
        donors,
        isLoading,
        error,
        totalCount,
        refetch: fetchDonors,
        toggleAvailability,
        updateDonorProfile,
    };
}

// Hook for finding nearby donors using PostGIS
export function useNearbyDonors(options: {
    bloodType: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
    limit?: number;
}) {
    const { bloodType, latitude, longitude, radiusKm = 25, limit = 50 } = options;
    const [donors, setDonors] = useState<SupabaseDonor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNearby = async () => {
            setIsLoading(true);
            try {
                // Call the PostGIS function we created
                const { data, error: rpcError } = await supabase.rpc('find_nearby_donors', {
                    p_blood_type: bloodType,
                    p_latitude: latitude,
                    p_longitude: longitude,
                    p_radius_km: radiusKm,
                    p_limit: limit,
                });

                if (rpcError) {
                    throw rpcError;
                }

                if (data && data.length > 0) {
                    const transformedDonors: SupabaseDonor[] = data.map((row: any) => ({
                        id: row.user_id,
                        userId: row.user_id,
                        name: row.full_name || 'Anonymous Donor',
                        email: '',
                        phone: null,
                        avatarUrl: null,
                        bloodType,
                        latitude: null,
                        longitude: null,
                        city: null,
                        distance: parseFloat(row.distance_km),
                        totalDonations: 0,
                        litersD: 0,
                        livesSaved: 0,
                        donationStreak: 0,
                        lastDonationDate: row.last_donation_date,
                        nextEligibleDate: null,
                        eligibilityStatus: 'eligible',
                        isAvailable: row.is_available,
                        emergencyAvailable: true,
                        verificationStatus: 'verified',
                        badge: 'bronze',
                        points: 0,
                        reliabilityScore: parseFloat(row.reliability_score) || 0.5,
                        responseRate: 0.5,
                        churnRiskScore: 0.5,
                    }));

                    setDonors(transformedDonors);
                } else {
                    // Fallback to mock data filtered by distance
                    const mockFiltered = MOCK_DONORS
                        .filter(d => d.bloodType === bloodType && d.distance && d.distance <= radiusKm)
                        .slice(0, limit);
                    setDonors(mockFiltered);
                }
            } catch (err) {
                console.warn('⚠️ PostGIS query failed, using fallback:', err);
                const mockFiltered = MOCK_DONORS
                    .filter(d => d.bloodType === bloodType && d.distance && d.distance <= radiusKm)
                    .slice(0, limit);
                setDonors(mockFiltered);
            } finally {
                setIsLoading(false);
            }
        };

        if (bloodType && latitude && longitude) {
            fetchNearby();
        }
    }, [bloodType, latitude, longitude, radiusKm, limit]);

    return { donors, isLoading, error };
}
