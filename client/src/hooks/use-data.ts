import { useState, useEffect, useCallback, useRef } from 'react';
import { donorAPI, bloodRequestAPI, inventoryAPI, statsAPI, realtimeAPI, contactAPI } from '@/lib/firebase/api';

// Custom hook for managing donors data with real-time updates
export function useDonors() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionActive = useRef(false);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donorAPI.getAllDonors();
      setDonors(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch donors');
      setLoading(false);
    }
  }, []);

  const fetchDonorsByBloodType = useCallback(async (bloodType: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await donorAPI.getDonorsByBloodType(bloodType);
      setDonors(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Immediately fetch donors as a fallback (doesn't wait for real-time)
    fetchDonors();

    // Set up real-time subscription with timeout protection
    const timeoutId = setTimeout(() => {
      if (loading && !subscriptionActive.current) {
        console.warn('Donor subscription timeout - using fetched data');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Set up real-time subscription
    const unsubscribe = realtimeAPI.subscribeToDonors((newDonors) => {
      subscriptionActive.current = true;
      setDonors(newDonors);
      setLoading(false);
      setError(null);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return {
    donors,
    loading,
    error,
    refetch: fetchDonors,
    fetchByBloodType: fetchDonorsByBloodType
  };
}


// Custom hook for emergency requests with real-time updates
export function useEmergencyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionActive = useRef(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bloodRequestAPI.getEmergencyRequests();
      setRequests(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Immediately fetch requests as a fallback (doesn't wait for real-time)
    fetchRequests();

    // Set up real-time subscription with timeout protection
    const timeoutId = setTimeout(() => {
      if (loading && !subscriptionActive.current) {
        console.warn('Emergency requests subscription timeout - using fetched data');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Set up real-time subscription
    const unsubscribe = realtimeAPI.subscribeToEmergencyRequests((newRequests) => {
      subscriptionActive.current = true;
      setRequests(newRequests);
      setLoading(false);
      setError(null);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests
  };
}
// Custom hook for blood inventory with real-time updates
export function useBloodInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryAPI.getBloodInventory();
      setInventory(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInventory = useCallback(async (itemId: string, units: number) => {
    try {
      await inventoryAPI.updateInventory(itemId, units);
      await fetchInventory(); // Refresh after update
      return true;
    } catch (err) {
      throw new Error((err as Error).message || 'Failed to update inventory');
    }
  }, [fetchInventory]);

  useEffect(() => {
    // Set up real-time subscription
    const unsubscribe = realtimeAPI.subscribeToInventory((newInventory) => {
      setInventory(newInventory);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
    updateInventory
  };
}
// Custom hook for dashboard statistics
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDonors: 0,
    pendingRequests: 0,
    bloodUnits: 0,
    emergencyRequests: 0,
    moderators: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch statistics');
      // Set fallback stats so UI always has something to show
      setStats({
        totalUsers: 8,
        activeDonors: 6,
        pendingRequests: 0,
        bloodUnits: 209,
        emergencyRequests: 0,
        moderators: 1
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
// Custom hook for contact operations
export function useContacts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactDonor = useCallback(async (donorId: string, contactType: string, message?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await contactAPI.contactDonor(donorId, contactType, message);
      return result;
    } catch (err) {
      setError((err as Error).message || 'Failed to contact donor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contactDonor,
    loading,
    error
  };
}

// Combined hook for admin dashboard data
export function useAdminDashboard() {
  const { donors, loading: donorsLoading, error: donorsError, refetch: refetchDonors } = useDonors();
  const { requests, loading: requestsLoading, error: requestsError, refetch: refetchRequests } = useEmergencyRequests();
  const { inventory, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useBloodInventory();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

  const loading = donorsLoading || requestsLoading || inventoryLoading || statsLoading;
  const error = donorsError || requestsError || inventoryError || statsError;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchDonors(),
      refetchRequests(),
      refetchInventory(),
      refetchStats()
    ]);
  }, [refetchDonors, refetchRequests, refetchInventory, refetchStats]);

  return {
    donors,
    emergencyRequests: requests,
    inventory,
    stats,
    loading,
    error,
    refetchAll
  };
}