/**
 * Supabase real-time subscription hooks
 * Provides easy-to-use real-time data streaming from Supabase tables
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Activity event for live feed
export interface LiveActivity {
    id: string;
    type: 'donation' | 'request' | 'match' | 'fulfillment' | 'registration' | 'achievement';
    title: string;
    description: string;
    bloodType?: string;
    location?: string;
    userName?: string;
    userAvatar?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

// Notification from database
export interface RealtimeNotification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
}

// Generic real-time subscription options
interface UseRealtimeOptions<T> {
    table: string;
    filter?: {
        column: string;
        operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
        value: any;
    };
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (oldRecord: T) => void;
    enabled?: boolean;
}

/**
 * Generic hook for subscribing to real-time changes on any table
 */
export function useRealtimeSubscription<T = any>(options: UseRealtimeOptions<T>) {
    const { table, filter, onInsert, onUpdate, onDelete, enabled = true } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!enabled) {
            setIsConnected(false);
            return;
        }

        try {
            const channelName = `realtime-${table}-${Date.now()}`;

            let channel = supabase.channel(channelName);

            // Build the filter config
            const filterConfig: any = {
                event: '*',
                schema: 'public',
                table,
            };

            if (filter) {
                filterConfig.filter = `${filter.column}=${filter.operator}.${filter.value}`;
            }

            channel = channel.on(
                'postgres_changes' as any,
                filterConfig,
                (payload: RealtimePostgresChangesPayload<T>) => {
                    switch (payload.eventType) {
                        case 'INSERT':
                            onInsert?.(payload.new as T);
                            break;
                        case 'UPDATE':
                            onUpdate?.(payload.new as T);
                            break;
                        case 'DELETE':
                            onDelete?.(payload.old as T);
                            break;
                    }
                }
            );

            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    setError(null);
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsConnected(false);
                    setError(`Channel ${status}`);
                }
            });

            channelRef.current = channel;

            return () => {
                if (channelRef.current) {
                    supabase.removeChannel(channelRef.current);
                    channelRef.current = null;
                }
            };
        } catch (err: any) {
            setError(err.message);
            setIsConnected(false);
        }
    }, [table, filter?.column, filter?.operator, filter?.value, enabled]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
            setIsConnected(false);
        }
    }, []);

    return { isConnected, error, unsubscribe };
}

/**
 * Hook for live activity feed - subscribes to multiple tables
 * and generates a unified activity stream
 */
export function useLiveActivityFeed(options: { limit?: number; enabled?: boolean } = {}) {
    const { limit = 20, enabled = true } = options;
    const [activities, setActivities] = useState<LiveActivity[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Add a new activity to the feed
    const addActivity = useCallback((activity: LiveActivity) => {
        setActivities(prev => {
            const updated = [activity, ...prev].slice(0, limit);
            return updated;
        });
    }, [limit]);

    // Generate mock activities for demo
    useEffect(() => {
        if (!enabled) return;

        // Initial mock activities
        const mockActivities: LiveActivity[] = [
            {
                id: '1',
                type: 'donation',
                title: 'New Donation',
                description: 'Aarav just donated 450ml of O- blood',
                bloodType: 'O-',
                location: 'Kathmandu',
                userName: 'Aarav Sharma',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
            },
            {
                id: '2',
                type: 'request',
                title: 'Emergency Request',
                description: 'Critical need for AB- blood at Bir Hospital',
                bloodType: 'AB-',
                location: 'Mahaboudha',
                timestamp: new Date(Date.now() - 12 * 60 * 1000),
            },
            {
                id: '3',
                type: 'match',
                title: 'Donor Matched',
                description: 'Priya matched with emergency request #1247',
                bloodType: 'A+',
                userName: 'Priya Patel',
                timestamp: new Date(Date.now() - 25 * 60 * 1000),
            },
            {
                id: '4',
                type: 'achievement',
                title: 'New Achievement',
                description: 'Bikash earned the "Gold Donor" badge!',
                userName: 'Bikash Adhikari',
                timestamp: new Date(Date.now() - 45 * 60 * 1000),
            },
            {
                id: '5',
                type: 'registration',
                title: 'New Donor',
                description: 'Maya just registered as a B+ donor',
                bloodType: 'B+',
                userName: 'Maya Rai',
                location: 'Lalitpur',
                timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            },
        ];

        setActivities(mockActivities);

        // Simulate real-time updates with random activities
        const activityTypes = ['donation', 'request', 'match', 'fulfillment', 'registration', 'achievement'] as const;
        const names = ['Ram', 'Shyam', 'Hari', 'Gita', 'Sita', 'Krishna', 'Radha', 'Lakshmi'];
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const locations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'];

        const generateRandomActivity = (): LiveActivity => {
            const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];

            const templates: Record<typeof type, { title: string; description: string }> = {
                donation: { title: 'New Donation', description: `${name} donated 450ml of ${bloodType} blood` },
                request: { title: 'Blood Request', description: `${bloodType} blood needed at ${location}` },
                match: { title: 'Donor Matched', description: `${name} matched with a blood request` },
                fulfillment: { title: 'Request Fulfilled', description: `Blood request in ${location} fulfilled` },
                registration: { title: 'New Donor', description: `${name} registered as ${bloodType} donor` },
                achievement: { title: 'Achievement Unlocked', description: `${name} earned a donor badge!` },
            };

            return {
                id: `activity-${Date.now()}-${Math.random()}`,
                type,
                ...templates[type],
                bloodType,
                location,
                userName: name,
                timestamp: new Date(),
            };
        };

        // Add random activity every 15-45 seconds (for demo purposes)
        const interval = setInterval(() => {
            const newActivity = generateRandomActivity();
            addActivity(newActivity);
        }, 15000 + Math.random() * 30000);

        setIsConnected(true);

        return () => {
            clearInterval(interval);
        };
    }, [enabled, addActivity]);

    // Subscribe to actual Supabase tables when connected
    useEffect(() => {
        if (!enabled) return;

        // Try to connect to real Supabase channels
        const channels: RealtimeChannel[] = [];

        try {
            // Donation records channel
            const donationChannel = supabase
                .channel('live-donations')
                .on(
                    'postgres_changes' as any,
                    { event: 'INSERT', schema: 'public', table: 'donation_records' },
                    (payload: any) => {
                        addActivity({
                            id: payload.new.id,
                            type: 'donation',
                            title: 'New Donation',
                            description: `A donor just donated blood`,
                            bloodType: payload.new.blood_type,
                            timestamp: new Date(payload.new.created_at),
                        });
                    }
                )
                .subscribe();
            channels.push(donationChannel);

            // Emergency requests channel
            const requestChannel = supabase
                .channel('live-requests')
                .on(
                    'postgres_changes' as any,
                    { event: 'INSERT', schema: 'public', table: 'emergency_requests' },
                    (payload: any) => {
                        addActivity({
                            id: payload.new.id,
                            type: 'request',
                            title: 'Emergency Request',
                            description: `${payload.new.blood_type} blood needed at ${payload.new.hospital_name}`,
                            bloodType: payload.new.blood_type,
                            location: payload.new.hospital_address,
                            timestamp: new Date(payload.new.created_at),
                        });
                    }
                )
                .subscribe();
            channels.push(requestChannel);

            // Achievements channel
            const achievementChannel = supabase
                .channel('live-achievements')
                .on(
                    'postgres_changes' as any,
                    { event: 'INSERT', schema: 'public', table: 'donor_achievements' },
                    (payload: any) => {
                        addActivity({
                            id: payload.new.id,
                            type: 'achievement',
                            title: 'Achievement Unlocked',
                            description: `A donor earned a new badge!`,
                            timestamp: new Date(payload.new.created_at),
                        });
                    }
                )
                .subscribe();
            channels.push(achievementChannel);

        } catch (err) {
            console.warn('Real-time channels not available, using mock data');
        }

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, [enabled, addActivity]);

    const clearActivities = useCallback(() => {
        setActivities([]);
    }, []);

    return {
        activities,
        isConnected,
        addActivity,
        clearActivities,
    };
}

/**
 * Hook for real-time user notifications
 */
export function useRealtimeNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch existing notifications
    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (data) {
                const transformed: RealtimeNotification[] = data.map((n: any) => ({
                    id: n.id,
                    userId: n.user_id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data,
                    isRead: n.is_read,
                    createdAt: new Date(n.created_at),
                }));

                setNotifications(transformed);
                setUnreadCount(transformed.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.warn('Failed to fetch notifications:', err);
            // Use empty array as fallback
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (userId) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        }
    }, [userId]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        if (userId) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);
        }
    }, [userId]);

    // Subscribe to new notifications
    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload: any) => {
                    const newNotification: RealtimeNotification = {
                        id: payload.new.id,
                        userId: payload.new.user_id,
                        type: payload.new.type,
                        title: payload.new.title,
                        message: payload.new.message,
                        data: payload.new.data,
                        isRead: false,
                        createdAt: new Date(payload.new.created_at),
                    };

                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}

/**
 * Hook for connection status monitoring
 */
export function useSupabaseConnectionStatus() {
    const [isConnected, setIsConnected] = useState(false);
    const [lastPing, setLastPing] = useState<Date | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(0);
                setIsConnected(!error);
                setLastPing(new Date());
            } catch {
                setIsConnected(false);
            }
        };

        // Initial check
        checkConnection();

        // Periodic checks every 30 seconds
        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    return { isConnected, lastPing };
}

// ============================================
// Emergency Request Alerts
// ============================================

export interface EmergencyRequestAlert {
    id: string;
    bloodType: string;
    unitsNeeded: number;
    urgency: 'life_threatening' | 'critical' | 'urgent' | 'normal';
    hospitalName: string;
    hospitalCity: string;
    patientName?: string;
    expiresAt: Date;
    createdAt: Date;
    distance?: number;
}

interface UseEmergencyAlertsOptions {
    enabled?: boolean;
    bloodType?: string | null; // Filter by matching blood type
    maxDistance?: number; // Filter by distance in km (requires lat/lng)
    latitude?: number;
    longitude?: number;
    onNewAlert?: (alert: EmergencyRequestAlert) => void;
}

/**
 * Hook for real-time emergency request alerts
 * Use this to show notifications when new urgent requests come in
 */
export function useEmergencyRequestAlerts(options: UseEmergencyAlertsOptions = {}) {
    const { enabled = true, bloodType, onNewAlert } = options;
    const [alerts, setAlerts] = useState<EmergencyRequestAlert[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [latestAlert, setLatestAlert] = useState<EmergencyRequestAlert | null>(null);

    // Fetch current active emergency requests
    const fetchActiveRequests = useCallback(async () => {
        try {
            let query = supabase
                .from('emergency_requests')
                .select('*')
                .in('status', ['pending', 'matching', 'donors_found'])
                .gt('expires_at', new Date().toISOString())
                .order('priority_score', { ascending: false })
                .limit(20);

            if (bloodType) {
                query = query.eq('blood_type', bloodType);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const transformed: EmergencyRequestAlert[] = data.map((r: any) => ({
                    id: r.id,
                    bloodType: r.blood_type,
                    unitsNeeded: r.units_needed,
                    urgency: r.urgency,
                    hospitalName: r.hospital_name,
                    hospitalCity: r.hospital_city,
                    patientName: r.patient_name,
                    expiresAt: new Date(r.expires_at),
                    createdAt: new Date(r.created_at),
                }));
                setAlerts(transformed);
            }
        } catch (err) {
            console.warn('Failed to fetch emergency requests:', err);
            // Use mock alerts for development
            setAlerts([
                {
                    id: 'mock-1',
                    bloodType: 'O-',
                    unitsNeeded: 3,
                    urgency: 'critical',
                    hospitalName: 'Bir Hospital',
                    hospitalCity: 'Kathmandu',
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                },
            ]);
        }
    }, [bloodType]);

    // Subscribe to new emergency requests
    useEffect(() => {
        if (!enabled) return;

        fetchActiveRequests();

        const channel = supabase
            .channel('emergency-alerts')
            .on(
                'postgres_changes' as any,
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'emergency_requests',
                },
                (payload: any) => {
                    const newAlert: EmergencyRequestAlert = {
                        id: payload.new.id,
                        bloodType: payload.new.blood_type,
                        unitsNeeded: payload.new.units_needed,
                        urgency: payload.new.urgency,
                        hospitalName: payload.new.hospital_name,
                        hospitalCity: payload.new.hospital_city,
                        patientName: payload.new.patient_name,
                        expiresAt: new Date(payload.new.expires_at),
                        createdAt: new Date(payload.new.created_at),
                    };

                    // Check blood type filter if specified
                    if (bloodType && bloodType !== payload.new.blood_type) {
                        return;
                    }

                    setAlerts(prev => [newAlert, ...prev]);
                    setLatestAlert(newAlert);
                    onNewAlert?.(newAlert);
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [enabled, bloodType, onNewAlert, fetchActiveRequests]);

    const dismissAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        if (latestAlert?.id === alertId) {
            setLatestAlert(null);
        }
    }, [latestAlert]);

    const clearLatest = useCallback(() => {
        setLatestAlert(null);
    }, []);

    return {
        alerts,
        latestAlert,
        isConnected,
        dismissAlert,
        clearLatest,
        refetch: fetchActiveRequests,
    };
}

// ============================================
// Live Inventory Updates
// ============================================

export interface InventoryStatus {
    bloodBankId: string;
    bloodBankName: string;
    bloodType: string;
    unitsAvailable: number;
    totalCapacity: number;
    status: 'critical' | 'low' | 'adequate' | 'good' | 'surplus';
    fillPercentage: number;
    daysUntilStockout: number;
    lastUpdated: Date;
}

interface UseLiveInventoryOptions {
    enabled?: boolean;
    bloodBankId?: string;
    city?: string;
    onCriticalLevel?: (inventory: InventoryStatus) => void;
}

/**
 * Hook for real-time blood inventory updates
 * Monitors inventory levels and alerts on critical/low status
 */
export function useLiveInventory(options: UseLiveInventoryOptions = {}) {
    const { enabled = true, bloodBankId, city, onCriticalLevel } = options;
    const [inventory, setInventory] = useState<InventoryStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [criticalItems, setCriticalItems] = useState<InventoryStatus[]>([]);

    // Fetch current inventory
    const fetchInventory = useCallback(async () => {
        try {
            let query = supabase
                .from('blood_inventory')
                .select(`
                    *,
                    blood_banks!inner(id, name, city)
                `);

            if (bloodBankId) {
                query = query.eq('blood_bank_id', bloodBankId);
            }
            if (city) {
                query = query.eq('blood_banks.city', city);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const transformed: InventoryStatus[] = data.map((item: any) => ({
                    bloodBankId: item.blood_bank_id,
                    bloodBankName: item.blood_banks?.name || 'Unknown',
                    bloodType: item.blood_type,
                    unitsAvailable: item.units_available,
                    totalCapacity: item.total_capacity,
                    status: item.status,
                    fillPercentage: item.fill_percentage,
                    daysUntilStockout: item.days_until_stockout,
                    lastUpdated: new Date(item.updated_at),
                }));

                setInventory(transformed);
                setCriticalItems(transformed.filter(i => i.status === 'critical' || i.status === 'low'));
            }
        } catch (err) {
            console.warn('Failed to fetch inventory:', err);
            // Mock data for development
            const mockInventory: InventoryStatus[] = [
                { bloodBankId: '1', bloodBankName: 'Central Blood Bank', bloodType: 'O-', unitsAvailable: 5, totalCapacity: 50, status: 'critical', fillPercentage: 10, daysUntilStockout: 2, lastUpdated: new Date() },
                { bloodBankId: '1', bloodBankName: 'Central Blood Bank', bloodType: 'AB-', unitsAvailable: 8, totalCapacity: 40, status: 'low', fillPercentage: 20, daysUntilStockout: 4, lastUpdated: new Date() },
                { bloodBankId: '1', bloodBankName: 'Central Blood Bank', bloodType: 'A+', unitsAvailable: 35, totalCapacity: 50, status: 'good', fillPercentage: 70, daysUntilStockout: 14, lastUpdated: new Date() },
                { bloodBankId: '1', bloodBankName: 'Central Blood Bank', bloodType: 'O+', unitsAvailable: 42, totalCapacity: 50, status: 'good', fillPercentage: 84, daysUntilStockout: 21, lastUpdated: new Date() },
            ];
            setInventory(mockInventory);
            setCriticalItems(mockInventory.filter(i => i.status === 'critical' || i.status === 'low'));
        } finally {
            setIsLoading(false);
        }
    }, [bloodBankId, city]);

    // Subscribe to inventory changes
    useEffect(() => {
        if (!enabled) return;

        fetchInventory();

        const channel = supabase
            .channel('live-inventory')
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: 'blood_inventory',
                },
                async (payload: any) => {
                    // Refetch to get joined data
                    await fetchInventory();

                    // Check for critical level alerts
                    if (payload.eventType === 'UPDATE' &&
                        (payload.new.status === 'critical' || payload.new.status === 'low')) {
                        const alertItem: InventoryStatus = {
                            bloodBankId: payload.new.blood_bank_id,
                            bloodBankName: 'Blood Bank', // Would need join
                            bloodType: payload.new.blood_type,
                            unitsAvailable: payload.new.units_available,
                            totalCapacity: payload.new.total_capacity,
                            status: payload.new.status,
                            fillPercentage: payload.new.fill_percentage,
                            daysUntilStockout: payload.new.days_until_stockout,
                            lastUpdated: new Date(payload.new.updated_at),
                        };
                        onCriticalLevel?.(alertItem);
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [enabled, fetchInventory, onCriticalLevel]);

    // Get inventory grouped by blood type (city-wide totals)
    const inventoryByType = inventory.reduce((acc, item) => {
        if (!acc[item.bloodType]) {
            acc[item.bloodType] = { total: 0, capacity: 0, status: 'good' as InventoryStatus['status'] };
        }
        acc[item.bloodType].total += item.unitsAvailable;
        acc[item.bloodType].capacity += item.totalCapacity;

        // Set worst status
        const statusRank = { critical: 0, low: 1, adequate: 2, good: 3, surplus: 4 };
        if (statusRank[item.status] < statusRank[acc[item.bloodType].status]) {
            acc[item.bloodType].status = item.status;
        }
        return acc;
    }, {} as Record<string, { total: number; capacity: number; status: InventoryStatus['status'] }>);

    return {
        inventory,
        inventoryByType,
        criticalItems,
        isLoading,
        isConnected,
        refetch: fetchInventory,
    };
}

