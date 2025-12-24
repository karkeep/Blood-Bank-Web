/**
 * Supabase-powered hook for emergency blood requests
 * Supports CRUD operations, real-time updates, and matching
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type EmergencyRequestRow = Database['public']['Tables']['emergency_requests']['Row'];

// Extended emergency request type
export interface SupabaseEmergencyRequest {
    id: string;
    requesterId: string;
    requesterName: string | null;
    requesterEmail: string | null;

    // Patient Info
    patientName: string;
    patientAge: number | null;
    patientGender: string | null;
    bloodType: string;
    unitsNeeded: number;
    bloodComponent: string;

    // Urgency
    urgency: 'normal' | 'urgent' | 'critical' | 'life_threatening';
    priorityScore: number;

    // Location
    hospitalId: string | null;
    hospitalName: string;
    hospitalAddress: string;
    latitude: number | null;
    longitude: number | null;

    // Contact
    contactName: string;
    contactPhone: string;
    contactRelation: string;

    // Status
    status: 'pending' | 'matching' | 'donors_found' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';
    matchedDonorsCount: number;
    fulfilledUnits: number;

    // Verification
    isVerified: boolean;

    // Timeline
    neededBy: string | null;
    expiresAt: string;
    fulfilledAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface CreateRequestData {
    patientName: string;
    patientAge?: number;
    patientGender?: string;
    bloodType: string;
    unitsNeeded: number;
    bloodComponent?: string;
    urgency: 'normal' | 'urgent' | 'critical' | 'life_threatening';
    hospitalName: string;
    hospitalAddress: string;
    contactName: string;
    contactPhone: string;
    contactRelation: string;
    neededBy?: string;
    expiresAt?: string;
}

interface UseSupabaseRequestsOptions {
    userId?: string;
    status?: string[];
    urgency?: string[];
    bloodType?: string;
    limit?: number;
    enableRealtime?: boolean;
}

interface UseSupabaseRequestsResult {
    requests: SupabaseEmergencyRequest[];
    activeRequests: SupabaseEmergencyRequest[];
    userRequests: SupabaseEmergencyRequest[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
    refetch: () => Promise<void>;

    // Actions
    createRequest: (data: CreateRequestData) => Promise<SupabaseEmergencyRequest>;
    updateRequest: (id: string, data: Partial<CreateRequestData>) => Promise<void>;
    cancelRequest: (id: string, reason?: string) => Promise<void>;
    fulfillRequest: (id: string, units: number) => Promise<void>;
}

// Mock data for fallback
const MOCK_REQUESTS: SupabaseEmergencyRequest[] = [
    {
        id: 'mock-req-1',
        requesterId: 'user-1',
        requesterName: 'Ram Prasad',
        requesterEmail: 'ram@example.com',
        patientName: 'Sita Devi',
        patientAge: 45,
        patientGender: 'female',
        bloodType: 'O-',
        unitsNeeded: 3,
        bloodComponent: 'whole_blood',
        urgency: 'critical',
        priorityScore: 75,
        hospitalId: null,
        hospitalName: 'Bir Hospital',
        hospitalAddress: 'Mahaboudha, Kathmandu',
        latitude: 27.7051,
        longitude: 85.3153,
        contactName: 'Ram Prasad',
        contactPhone: '+977-980-1234567',
        contactRelation: 'Husband',
        status: 'matching',
        matchedDonorsCount: 2,
        fulfilledUnits: 0,
        isVerified: true,
        neededBy: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        fulfilledAt: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'mock-req-2',
        requesterId: 'user-2',
        requesterName: 'Hari Sharma',
        requesterEmail: 'hari@example.com',
        patientName: 'Gita Sharma',
        patientAge: 32,
        patientGender: 'female',
        bloodType: 'A+',
        unitsNeeded: 2,
        bloodComponent: 'whole_blood',
        urgency: 'urgent',
        priorityScore: 50,
        hospitalId: null,
        hospitalName: 'Grande Hospital',
        hospitalAddress: 'Dhapasi, Kathmandu',
        latitude: 27.7469,
        longitude: 85.3244,
        contactName: 'Hari Sharma',
        contactPhone: '+977-980-2345678',
        contactRelation: 'Father',
        status: 'pending',
        matchedDonorsCount: 0,
        fulfilledUnits: 0,
        isVerified: false,
        neededBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        fulfilledAt: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'mock-req-3',
        requesterId: 'user-3',
        requesterName: 'Shyam Thapa',
        requesterEmail: 'shyam@example.com',
        patientName: 'Krishna Thapa',
        patientAge: 58,
        patientGender: 'male',
        bloodType: 'B+',
        unitsNeeded: 4,
        bloodComponent: 'platelets',
        urgency: 'life_threatening',
        priorityScore: 100,
        hospitalId: null,
        hospitalName: 'Norvic Hospital',
        hospitalAddress: 'Thapathali, Kathmandu',
        latitude: 27.6947,
        longitude: 85.3209,
        contactName: 'Shyam Thapa',
        contactPhone: '+977-980-3456789',
        contactRelation: 'Son',
        status: 'donors_found',
        matchedDonorsCount: 5,
        fulfilledUnits: 2,
        isVerified: true,
        neededBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fulfilledAt: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export function useSupabaseRequests(options: UseSupabaseRequestsOptions = {}): UseSupabaseRequestsResult {
    const {
        userId,
        status = ['pending', 'matching', 'donors_found', 'partially_fulfilled'],
        urgency,
        bloodType,
        limit = 50,
        enableRealtime = true,
    } = options;

    const [requests, setRequests] = useState<SupabaseEmergencyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [usesFallback, setUsesFallback] = useState(false);

    // Transform database row to our interface
    const transformRequest = (row: any): SupabaseEmergencyRequest => ({
        id: row.id,
        requesterId: row.requester_id,
        requesterName: row.users?.full_name || null,
        requesterEmail: row.users?.email || null,
        patientName: row.patient_name,
        patientAge: row.patient_age,
        patientGender: row.patient_gender,
        bloodType: row.blood_type,
        unitsNeeded: row.units_needed,
        bloodComponent: row.blood_components || 'whole_blood',
        urgency: row.urgency,
        priorityScore: row.priority_score || 0,
        hospitalId: row.hospital_id,
        hospitalName: row.hospital_name,
        hospitalAddress: row.hospital_address,
        latitude: null, // From geography
        longitude: null,
        contactName: row.contact_name,
        contactPhone: row.contact_phone,
        contactRelation: row.contact_relation,
        status: row.status,
        matchedDonorsCount: row.matched_donors_count || 0,
        fulfilledUnits: row.fulfilled_units || 0,
        isVerified: row.is_verified || false,
        neededBy: row.needed_by,
        expiresAt: row.expires_at,
        fulfilledAt: row.fulfilled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('emergency_requests')
                .select(`
          *,
          users!requester_id(full_name, email)
        `, { count: 'exact' })
                .order('priority_score', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);

            // Apply filters
            if (status && status.length > 0) {
                query = query.in('status', status);
            }

            if (urgency && urgency.length > 0) {
                query = query.in('urgency', urgency);
            }

            if (bloodType && bloodType !== 'all') {
                query = query.eq('blood_type', bloodType);
            }

            if (userId) {
                query = query.eq('requester_id', userId);
            }

            const { data, error: queryError, count } = await query;

            if (queryError) {
                throw queryError;
            }

            if (data && data.length > 0) {
                const transformedRequests = data.map(transformRequest);
                setRequests(transformedRequests);
                setTotalCount(count || transformedRequests.length);
                setUsesFallback(false);
            } else {
                console.log('📦 Using mock request data (Supabase not configured or empty)');
                useFallbackData();
            }
        } catch (err) {
            console.warn('⚠️ Supabase query failed, using fallback:', err);
            useFallbackData();
        } finally {
            setIsLoading(false);
        }
    }, [userId, status, urgency, bloodType, limit]);

    // Fallback to mock data
    const useFallbackData = useCallback(() => {
        let filteredRequests = [...MOCK_REQUESTS];

        if (status && status.length > 0) {
            filteredRequests = filteredRequests.filter(r => status.includes(r.status));
        }

        if (urgency && urgency.length > 0) {
            filteredRequests = filteredRequests.filter(r => urgency.includes(r.urgency));
        }

        if (bloodType && bloodType !== 'all') {
            filteredRequests = filteredRequests.filter(r => r.bloodType === bloodType);
        }

        if (userId) {
            filteredRequests = filteredRequests.filter(r => r.requesterId === userId);
        }

        setRequests(filteredRequests);
        setTotalCount(filteredRequests.length);
        setUsesFallback(true);
        setError(null);
    }, [userId, status, urgency, bloodType]);

    // Get active requests (pending, matching, donors_found)
    const activeRequests = requests.filter(r =>
        ['pending', 'matching', 'donors_found', 'partially_fulfilled'].includes(r.status)
    );

    // Get user's requests
    const userRequests = userId
        ? requests.filter(r => r.requesterId === userId)
        : [];

    // Create new request
    const createRequest = useCallback(async (data: CreateRequestData): Promise<SupabaseEmergencyRequest> => {
        if (usesFallback) {
            // Create mock request
            const newRequest: SupabaseEmergencyRequest = {
                id: `mock-req-${Date.now()}`,
                requesterId: 'current-user',
                requesterName: 'Current User',
                requesterEmail: 'user@example.com',
                patientName: data.patientName,
                patientAge: data.patientAge || null,
                patientGender: data.patientGender || null,
                bloodType: data.bloodType,
                unitsNeeded: data.unitsNeeded,
                bloodComponent: data.bloodComponent || 'whole_blood',
                urgency: data.urgency,
                priorityScore: data.urgency === 'life_threatening' ? 100 : data.urgency === 'critical' ? 75 : data.urgency === 'urgent' ? 50 : 25,
                hospitalId: null,
                hospitalName: data.hospitalName,
                hospitalAddress: data.hospitalAddress,
                latitude: null,
                longitude: null,
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactRelation: data.contactRelation,
                status: 'pending',
                matchedDonorsCount: 0,
                fulfilledUnits: 0,
                isVerified: false,
                neededBy: data.neededBy || null,
                expiresAt: data.expiresAt || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
                fulfilledAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setRequests(prev => [newRequest, ...prev]);
            return newRequest;
        }

        const { data: newRow, error: insertError } = await supabase
            .from('emergency_requests')
            .insert({
                patient_name: data.patientName,
                patient_age: data.patientAge,
                patient_gender: data.patientGender,
                blood_type: data.bloodType,
                units_needed: data.unitsNeeded,
                blood_components: data.bloodComponent || 'whole_blood',
                urgency: data.urgency,
                hospital_name: data.hospitalName,
                hospital_address: data.hospitalAddress,
                contact_name: data.contactName,
                contact_phone: data.contactPhone,
                contact_relation: data.contactRelation,
                needed_by: data.neededBy,
                expires_at: data.expiresAt || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Failed to create request: ${insertError.message}`);
        }

        const transformed = transformRequest(newRow);
        setRequests(prev => [transformed, ...prev]);
        return transformed;
    }, [usesFallback]);

    // Update request
    const updateRequest = useCallback(async (id: string, data: Partial<CreateRequestData>) => {
        if (usesFallback) {
            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
            ));
            return;
        }

        const updateData: Record<string, any> = {};
        if (data.patientName) updateData.patient_name = data.patientName;
        if (data.patientAge) updateData.patient_age = data.patientAge;
        if (data.unitsNeeded) updateData.units_needed = data.unitsNeeded;
        if (data.urgency) updateData.urgency = data.urgency;
        if (data.hospitalName) updateData.hospital_name = data.hospitalName;
        if (data.hospitalAddress) updateData.hospital_address = data.hospitalAddress;
        if (data.contactName) updateData.contact_name = data.contactName;
        if (data.contactPhone) updateData.contact_phone = data.contactPhone;
        updateData.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
            .from('emergency_requests')
            .update(updateData)
            .eq('id', id);

        if (updateError) {
            throw new Error(`Failed to update request: ${updateError.message}`);
        }

        await fetchRequests();
    }, [usesFallback, fetchRequests]);

    // Cancel request
    const cancelRequest = useCallback(async (id: string, reason?: string) => {
        if (usesFallback) {
            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : r
            ));
            return;
        }

        const { error: cancelError } = await supabase
            .from('emergency_requests')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (cancelError) {
            throw new Error(`Failed to cancel request: ${cancelError.message}`);
        }

        setRequests(prev => prev.map(r =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
        ));
    }, [usesFallback]);

    // Fulfill request (partial or full)
    const fulfillRequest = useCallback(async (id: string, units: number) => {
        const request = requests.find(r => r.id === id);
        if (!request) return;

        const newFulfilledUnits = request.fulfilledUnits + units;
        const newStatus = newFulfilledUnits >= request.unitsNeeded
            ? 'fulfilled'
            : 'partially_fulfilled';

        if (usesFallback) {
            setRequests(prev => prev.map(r =>
                r.id === id ? {
                    ...r,
                    fulfilledUnits: newFulfilledUnits,
                    status: newStatus as any,
                    fulfilledAt: newStatus === 'fulfilled' ? new Date().toISOString() : null,
                    updatedAt: new Date().toISOString(),
                } : r
            ));
            return;
        }

        const { error: fulfillError } = await supabase
            .from('emergency_requests')
            .update({
                fulfilled_units: newFulfilledUnits,
                status: newStatus,
                fulfilled_at: newStatus === 'fulfilled' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (fulfillError) {
            throw new Error(`Failed to fulfill request: ${fulfillError.message}`);
        }

        await fetchRequests();
    }, [requests, usesFallback, fetchRequests]);

    // Initial fetch
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Real-time subscription
    useEffect(() => {
        if (!enableRealtime || usesFallback) return;

        const unsubscribe = subscribeToTable('emergency_requests', (payload) => {
            console.log('🔄 Emergency request changed:', payload);
            fetchRequests();
        });

        return () => {
            unsubscribe();
        };
    }, [enableRealtime, usesFallback, fetchRequests]);

    return {
        requests,
        activeRequests,
        userRequests,
        isLoading,
        error,
        totalCount,
        refetch: fetchRequests,
        createRequest,
        updateRequest,
        cancelRequest,
        fulfillRequest,
    };
}

// Hook for matching donors to a request
export function useRequestMatching(requestId: string | null) {
    const [matchedDonors, setMatchedDonors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const findMatches = useCallback(async () => {
        if (!requestId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Get the request details
            const { data: request, error: requestError } = await supabase
                .from('emergency_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (requestError) throw requestError;

            // Find compatible donors using RPC
            const { data: donors, error: donorError } = await supabase.rpc('get_compatible_blood_types', {
                p_blood_type: request.blood_type,
            });

            if (donorError) throw donorError;

            setMatchedDonors(donors || []);
        } catch (err: any) {
            console.error('Error finding matches:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        if (requestId) {
            findMatches();
        }
    }, [requestId, findMatches]);

    return { matchedDonors, isLoading, error, refetch: findMatches };
}
