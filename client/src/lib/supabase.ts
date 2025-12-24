import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your-supabase-url' &&
    supabaseAnonKey !== 'your-supabase-anon-key';

// Create Supabase client (or null if not configured)
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : null;

// Export configuration status
export const isSupabaseEnabled = isSupabaseConfigured;

// Type definitions for database
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Blood type enum
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// User role enum
export type UserRole = 'donor' | 'requester' | 'volunteer' | 'moderator' | 'admin' | 'superadmin';

// Badge enum
export type Badge = 'newcomer' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

// Request urgency
export type Urgency = 'normal' | 'urgent' | 'critical' | 'life_threatening';

// Database schema types
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    firebase_uid: string | null;
                    email: string;
                    phone: string | null;
                    username: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    blood_type: BloodType;
                    address: Json;
                    account_status: string;
                    email_verified: boolean;
                    phone_verified: boolean;
                    created_at: string;
                    updated_at: string;
                    last_login_at: string | null;
                    deleted_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['users']['Insert']>;
            };
            donor_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    status: string;
                    total_donations: number;
                    liters_donated: number;
                    lives_saved: number;
                    donation_streak: number;
                    last_donation_date: string | null;
                    next_eligible_date: string | null;
                    eligibility_status: string;
                    city: string | null;
                    state: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    travel_radius_km: number;
                    emergency_available: boolean;
                    verification_status: string;
                    badge: Badge;
                    points: number;
                    reliability_score: number;
                    response_rate: number;
                    is_visible: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['donor_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['donor_profiles']['Insert']>;
            };
            emergency_requests: {
                Row: {
                    id: string;
                    requester_id: string;
                    hospital_id: string | null;
                    patient_name: string;
                    patient_age: number | null;
                    blood_type: BloodType;
                    units_needed: number;
                    urgency: Urgency;
                    request_reason: string;
                    priority_score: number;
                    hospital_name: string;
                    hospital_city: string;
                    latitude: number;
                    longitude: number;
                    contact_name: string;
                    contact_phone: string;
                    status: string;
                    matched_donors_count: number;
                    fulfilled_units: number;
                    expires_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['emergency_requests']['Row'], 'id' | 'priority_score' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['emergency_requests']['Insert']>;
            };
            blood_inventory: {
                Row: {
                    id: string;
                    blood_bank_id: string;
                    blood_type: BloodType;
                    units_available: number;
                    total_capacity: number;
                    status: string;
                    fill_percentage: number;
                    days_until_stockout: number;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['blood_inventory']['Row'], 'id' | 'status' | 'fill_percentage' | 'days_until_stockout'>;
                Update: Partial<Database['public']['Tables']['blood_inventory']['Insert']>;
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type: string;
                    is_read: boolean;
                    read_at: string | null;
                    related_entity_type: string | null;
                    related_entity_id: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
            };
            donation_records: {
                Row: {
                    id: string;
                    donor_id: string;
                    request_id: string | null;
                    blood_bank_id: string | null;
                    blood_type: BloodType;
                    volume_ml: number;
                    donation_type: string;
                    status: string;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['donation_records']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['donation_records']['Insert']>;
            };
        };
        Functions: {
            find_nearby_donors: {
                Args: {
                    p_blood_type: BloodType;
                    p_latitude: number;
                    p_longitude: number;
                    p_radius_km?: number;
                    p_limit?: number;
                };
                Returns: {
                    user_id: string;
                    full_name: string;
                    blood_type: BloodType;
                    distance_km: number;
                    reliability_score: number;
                    is_available: boolean;
                    last_donation_date: string | null;
                    badge: Badge;
                    phone: string | null;
                }[];
            };
            get_dashboard_stats: {
                Args: Record<string, never>;
                Returns: {
                    total_donors: number;
                    available_donors: number;
                    total_donations: number;
                    total_liters: number;
                    lives_saved: number;
                    active_requests: number;
                    fulfilled_requests: number;
                }[];
            };
            get_city_inventory_status: {
                Args: { p_city: string };
                Returns: {
                    blood_type: BloodType;
                    total_units: number;
                    total_capacity: number;
                    fill_percentage: number;
                    status: string;
                    blood_banks_count: number;
                    critical_count: number;
                }[];
            };
        };
    };
}

// Helper function to check connection
export async function checkSupabaseConnection(): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { error } = await supabase.from('users').select('count').limit(1);
        return !error;
    } catch {
        return false;
    }
}

// Get Supabase client or throw if not configured
export function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
}

// Safe Supabase getter that returns null instead of throwing
export function getSupabaseClientOrNull() {
    return supabase;
}

// Real-time subscription helper - returns unsubscribe function
export function subscribeToTable<T>(
    tableName: string,
    callback: (payload: { new: T; old: T | null; eventType: string }) => void
): () => void {
    if (!supabase) {
        // Return a no-op unsubscribe function if not configured
        return () => { };
    }

    const channel = supabase
        .channel(`${tableName}_changes`)
        .on(
            'postgres_changes' as any,
            { event: '*', schema: 'public', table: tableName },
            (payload: any) => {
                callback({
                    new: payload.new as T,
                    old: payload.old as T | null,
                    eventType: payload.eventType
                });
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        if (supabase) {
            supabase.removeChannel(channel);
        }
    };
}

