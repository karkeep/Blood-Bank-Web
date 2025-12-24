/**
 * Homepage Analytics Hooks
 * Provides real-time data from Supabase for homepage sections
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// Types
// ============================================

export interface TopDonor {
    id: string;
    displayName: string;
    bloodType: string;
    badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    totalDonations: number;
    litersDonated: number;
    livesSaved: number;
    lastDonationDate?: string;
}

export interface CityInventory {
    city: string;
    bloodType: string;
    unitsAvailable: number;
    totalCapacity: number;
    fillPercentage: number;
    status: 'Critical' | 'Low' | 'Stable';
}

export interface CityDonorStats {
    city: string;
    totalDonors: number;
    availableDonors: number;
    verifiedDonors: number;
    avgDonationsPerDonor: number;
    totalLitersDonated: number;
    totalLivesSaved: number;
}

export interface CityNeedingDonors {
    city: string;
    currentDonors: number;
    targetDonors: number;
    deficitPercentage: number;
    status: 'Critical' | 'Low' | 'Stable';
}

export interface HomepageKPIs {
    totalDonors: number;
    totalDonations: number;
    totalLiters: number;
    totalLivesSaved: number;
    activeRequests: number;
}

export interface HomepageSectionConfig {
    sectionKey: string;
    isVisible: boolean;
    title: string;
    subtitle: string;
    displayOrder: number;
    config: Record<string, unknown>;
}

// ============================================
// Mock Data (fallback when Supabase not configured)
// ============================================

const MOCK_TOP_DONORS: TopDonor[] = [
    { id: '1', displayName: 'Anonymous Hero', bloodType: 'B+', badge: 'gold', totalDonations: 20, litersDonated: 9.0, livesSaved: 60 },
    { id: '2', displayName: 'Anonymous Hero', bloodType: 'O-', badge: 'gold', totalDonations: 15, litersDonated: 6.8, livesSaved: 45 },
    { id: '3', displayName: 'Anonymous Hero', bloodType: 'A+', badge: 'silver', totalDonations: 12, litersDonated: 5.4, livesSaved: 36 },
];

const MOCK_CITY_INVENTORY: CityInventory[] = [
    { city: 'Kathmandu', bloodType: 'O-', unitsAvailable: 10, totalCapacity: 100, fillPercentage: 10, status: 'Critical' },
    { city: 'Kathmandu', bloodType: 'A+', unitsAvailable: 45, totalCapacity: 100, fillPercentage: 45, status: 'Low' },
    { city: 'Lalitpur', bloodType: 'B+', unitsAvailable: 30, totalCapacity: 100, fillPercentage: 30, status: 'Low' },
    { city: 'Lalitpur', bloodType: 'AB-', unitsAvailable: 55, totalCapacity: 100, fillPercentage: 55, status: 'Stable' },
    { city: 'Bhaktapur', bloodType: 'A-', unitsAvailable: 85, totalCapacity: 100, fillPercentage: 85, status: 'Stable' },
    { city: 'Bhaktapur', bloodType: 'O+', unitsAvailable: 90, totalCapacity: 100, fillPercentage: 90, status: 'Stable' },
    { city: 'Pokhara', bloodType: 'O+', unitsAvailable: 25, totalCapacity: 100, fillPercentage: 25, status: 'Low' },
    { city: 'Pokhara', bloodType: 'B-', unitsAvailable: 15, totalCapacity: 100, fillPercentage: 15, status: 'Critical' },
];

const MOCK_CITY_DONOR_STATS: CityDonorStats[] = [
    { city: 'Kathmandu', totalDonors: 1245, availableDonors: 850, verifiedDonors: 1100, avgDonationsPerDonor: 4.2, totalLitersDonated: 2350, totalLivesSaved: 15600 },
    { city: 'Pokhara', totalDonors: 1053, availableDonors: 720, verifiedDonors: 950, avgDonationsPerDonor: 3.8, totalLitersDonated: 1800, totalLivesSaved: 12000 },
    { city: 'Lalitpur', totalDonors: 928, availableDonors: 650, verifiedDonors: 850, avgDonationsPerDonor: 3.5, totalLitersDonated: 1500, totalLivesSaved: 9500 },
    { city: 'Biratnagar', totalDonors: 804, availableDonors: 550, verifiedDonors: 700, avgDonationsPerDonor: 3.2, totalLitersDonated: 1200, totalLivesSaved: 7800 },
    { city: 'Birgunj', totalDonors: 682, availableDonors: 480, verifiedDonors: 600, avgDonationsPerDonor: 3.0, totalLitersDonated: 1000, totalLivesSaved: 6500 },
];

const MOCK_CITIES_NEEDING_DONORS: CityNeedingDonors[] = [
    { city: 'Bhaktapur', currentDonors: 480, targetDonors: 1500, deficitPercentage: 68, status: 'Critical' },
    { city: 'Chitwan', currentDonors: 760, targetDonors: 2000, deficitPercentage: 62, status: 'Critical' },
    { city: 'Butwal', currentDonors: 675, targetDonors: 1500, deficitPercentage: 55, status: 'Low' },
    { city: 'Biratnagar', currentDonors: 1300, targetDonors: 2500, deficitPercentage: 48, status: 'Low' },
    { city: 'Birgunj', currentDonors: 1160, targetDonors: 2000, deficitPercentage: 42, status: 'Low' },
];

const MOCK_KPIS: HomepageKPIs = {
    totalDonors: 5890,
    totalDonations: 23650,
    totalLiters: 10642.5,
    totalLivesSaved: 70950,
    activeRequests: 12,
};

// ============================================
// Hooks
// ============================================

/**
 * Hook for fetching top donors for spotlight section
 */
export function useTopDonors(options: { limit?: number; anonymize?: boolean } = {}) {
    const { limit = 3, anonymize = true } = options;
    const [donors, setDonors] = useState<TopDonor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDonors = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                setDonors(MOCK_TOP_DONORS.slice(0, limit));
                return;
            }

            const { data, error: dbError } = await supabase
                .rpc('get_top_donors', { p_limit: limit, p_anonymize: anonymize });

            if (dbError) throw dbError;

            if (data && data.length > 0) {
                const formatted: TopDonor[] = data.map((d: any) => ({
                    id: d.id,
                    displayName: d.display_name,
                    bloodType: d.blood_type,
                    badge: d.badge?.toLowerCase() || 'bronze',
                    totalDonations: d.total_donations || 0,
                    litersDonated: parseFloat(d.liters_donated) || 0,
                    livesSaved: d.lives_saved || 0,
                    lastDonationDate: d.last_donation_date,
                }));
                setDonors(formatted);
            } else {
                // Fallback to mock data
                setDonors(MOCK_TOP_DONORS.slice(0, limit));
            }
        } catch (err: any) {
            console.warn('Failed to fetch top donors:', err.message);
            setDonors(MOCK_TOP_DONORS.slice(0, limit));
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [limit, anonymize]);

    useEffect(() => {
        fetchDonors();
    }, [fetchDonors]);

    return { donors, isLoading, error, refetch: fetchDonors };
}

/**
 * Hook for fetching city inventory status
 */
export function useCityInventory(options: { city?: string } = {}) {
    const { city } = options;
    const [inventory, setInventory] = useState<CityInventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Group inventory by city
    const inventoryByCity = inventory.reduce((acc, item) => {
        if (!acc[item.city]) {
            acc[item.city] = [];
        }
        acc[item.city].push(item);
        return acc;
    }, {} as Record<string, CityInventory[]>);

    // Get overall status for each city
    const getCityStatus = useCallback((cityName: string): 'Critical' | 'Low' | 'Stable' => {
        const cityItems = inventoryByCity[cityName] || [];
        const criticalCount = cityItems.filter(i => i.status === 'Critical').length;
        const lowCount = cityItems.filter(i => i.status === 'Low').length;
        if (criticalCount > 0) return 'Critical';
        if (lowCount > 1) return 'Low';
        return 'Stable';
    }, [inventoryByCity]);

    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                setInventory(city ? MOCK_CITY_INVENTORY.filter(i => i.city === city) : MOCK_CITY_INVENTORY);
                return;
            }

            const { data, error: dbError } = await supabase
                .rpc('get_city_inventory_status', { p_city: city || null });

            if (dbError) throw dbError;

            if (data && data.length > 0) {
                const formatted: CityInventory[] = data.map((d: any) => ({
                    city: d.city,
                    bloodType: d.blood_type,
                    unitsAvailable: d.units_available,
                    totalCapacity: d.total_capacity,
                    fillPercentage: parseFloat(d.fill_percentage) || 0,
                    status: d.status as 'Critical' | 'Low' | 'Stable',
                }));
                setInventory(formatted);
            } else {
                setInventory(city ? MOCK_CITY_INVENTORY.filter(i => i.city === city) : MOCK_CITY_INVENTORY);
            }
        } catch (err: any) {
            console.warn('Failed to fetch city inventory:', err.message);
            setInventory(city ? MOCK_CITY_INVENTORY.filter(i => i.city === city) : MOCK_CITY_INVENTORY);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [city]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    return { inventory, inventoryByCity, getCityStatus, isLoading, error, refetch: fetchInventory };
}

/**
 * Hook for fetching city donor statistics (for Top Donor Cities)
 */
export function useCityDonorStats(options: { limit?: number } = {}) {
    const { limit = 5 } = options;
    const [cities, setCities] = useState<CityDonorStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                setCities(MOCK_CITY_DONOR_STATS.slice(0, limit));
                return;
            }

            const { data, error: dbError } = await supabase
                .from('mv_city_donor_stats')
                .select('*')
                .order('total_donors', { ascending: false })
                .limit(limit);

            if (dbError) throw dbError;

            if (data && data.length > 0) {
                const formatted: CityDonorStats[] = data.map((d: any) => ({
                    city: d.city,
                    totalDonors: d.total_donors || 0,
                    availableDonors: d.available_donors || 0,
                    verifiedDonors: d.verified_donors || 0,
                    avgDonationsPerDonor: parseFloat(d.avg_donations_per_donor) || 0,
                    totalLitersDonated: parseFloat(d.total_liters_donated) || 0,
                    totalLivesSaved: d.total_lives_saved || 0,
                }));
                setCities(formatted);
            } else {
                setCities(MOCK_CITY_DONOR_STATS.slice(0, limit));
            }
        } catch (err: any) {
            console.warn('Failed to fetch city donor stats:', err.message);
            setCities(MOCK_CITY_DONOR_STATS.slice(0, limit));
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { cities, isLoading, error, refetch: fetchStats };
}

/**
 * Hook for fetching cities needing donors
 */
export function useCitiesNeedingDonors(options: { limit?: number } = {}) {
    const { limit = 5 } = options;
    const [cities, setCities] = useState<CityNeedingDonors[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCities = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                setCities(MOCK_CITIES_NEEDING_DONORS.slice(0, limit));
                return;
            }

            const { data, error: dbError } = await supabase
                .rpc('get_cities_needing_donors', { p_limit: limit });

            if (dbError) throw dbError;

            if (data && data.length > 0) {
                const formatted: CityNeedingDonors[] = data.map((d: any) => ({
                    city: d.city,
                    currentDonors: d.current_donors || 0,
                    targetDonors: d.target_donors || 0,
                    deficitPercentage: Math.abs(parseFloat(d.deficit_percentage)) || 0,
                    status: d.status as 'Critical' | 'Low' | 'Stable',
                }));
                setCities(formatted);
            } else {
                setCities(MOCK_CITIES_NEEDING_DONORS.slice(0, limit));
            }
        } catch (err: any) {
            console.warn('Failed to fetch cities needing donors:', err.message);
            setCities(MOCK_CITIES_NEEDING_DONORS.slice(0, limit));
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    return { cities, isLoading, error, refetch: fetchCities };
}

/**
 * Hook for fetching homepage KPIs
 */
export function useHomepageKPIs() {
    const [kpis, setKpis] = useState<HomepageKPIs>(MOCK_KPIS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKPIs = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                setKpis(MOCK_KPIS);
                return;
            }

            const { data, error: dbError } = await supabase
                .from('v_homepage_analytics')
                .select('*')
                .single();

            if (dbError) throw dbError;

            if (data) {
                setKpis({
                    totalDonors: data.total_donors || MOCK_KPIS.totalDonors,
                    totalDonations: data.total_donations || MOCK_KPIS.totalDonations,
                    totalLiters: parseFloat(data.total_liters) || MOCK_KPIS.totalLiters,
                    totalLivesSaved: data.total_lives_saved || MOCK_KPIS.totalLivesSaved,
                    activeRequests: data.active_requests || MOCK_KPIS.activeRequests,
                });
            }
        } catch (err: any) {
            console.warn('Failed to fetch homepage KPIs:', err.message);
            setKpis(MOCK_KPIS);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKPIs();
    }, [fetchKPIs]);

    return { kpis, isLoading, error, refetch: fetchKPIs };
}

/**
 * Hook for fetching homepage section settings (admin configured)
 */
export function useHomepageSections() {
    const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSections = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                // Default sections
                setSections([
                    { sectionKey: 'donor_spotlight', isVisible: true, title: 'Top Donor Spotlight', subtitle: 'Celebrating our blood heroes', displayOrder: 1, config: {} },
                    { sectionKey: 'city_inventory', isVisible: true, title: 'City Blood Inventory', subtitle: 'Real-time blood supply status', displayOrder: 2, config: {} },
                    { sectionKey: 'top_donor_cities', isVisible: true, title: 'Top Donor Cities', subtitle: 'Cities with most active donors', displayOrder: 3, config: {} },
                    { sectionKey: 'cities_needing_donors', isVisible: true, title: 'Cities Needing Donors', subtitle: 'Areas with donor shortage', displayOrder: 4, config: {} },
                ]);
                return;
            }

            const { data, error: dbError } = await supabase
                .from('homepage_content')
                .select('*')
                .eq('is_visible', true)
                .order('display_order', { ascending: true });

            if (dbError) throw dbError;

            if (data && data.length > 0) {
                const formatted: HomepageSectionConfig[] = data.map((d: any) => ({
                    sectionKey: d.section_key,
                    isVisible: d.is_visible,
                    title: d.title,
                    subtitle: d.subtitle,
                    displayOrder: d.display_order,
                    config: d.config || {},
                }));
                setSections(formatted);
            }
        } catch (err: any) {
            console.warn('Failed to fetch homepage sections:', err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    // Helper to check if a section is visible
    const isSectionVisible = useCallback((sectionKey: string): boolean => {
        const section = sections.find(s => s.sectionKey === sectionKey);
        return section?.isVisible ?? true;
    }, [sections]);

    // Helper to get section config
    const getSectionConfig = useCallback((sectionKey: string): HomepageSectionConfig | undefined => {
        return sections.find(s => s.sectionKey === sectionKey);
    }, [sections]);

    return { sections, isSectionVisible, getSectionConfig, isLoading, error, refetch: fetchSections };
}

/**
 * Combined hook for all homepage analytics data
 */
export function useHomepageAnalytics() {
    const { donors, isLoading: donorsLoading } = useTopDonors({ limit: 3 });
    const { inventoryByCity, getCityStatus, isLoading: inventoryLoading } = useCityInventory();
    const { cities: topCities, isLoading: topCitiesLoading } = useCityDonorStats({ limit: 5 });
    const { cities: needingDonors, isLoading: needingLoading } = useCitiesNeedingDonors({ limit: 5 });
    const { kpis, isLoading: kpisLoading } = useHomepageKPIs();
    const { sections, isSectionVisible, getSectionConfig, isLoading: sectionsLoading } = useHomepageSections();

    const isLoading = donorsLoading || inventoryLoading || topCitiesLoading || needingLoading || kpisLoading || sectionsLoading;

    return {
        donors,
        inventoryByCity,
        getCityStatus,
        topCities,
        needingDonors,
        kpis,
        sections,
        isSectionVisible,
        getSectionConfig,
        isLoading,
    };
}
