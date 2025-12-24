import { useState, useEffect } from 'react';
import { dbService, UserSchema, DonorProfileSchema, DB_PATHS } from '@/lib/firebase/database';

// Define the return type for our hook
interface UseDonors {
  donors: (UserSchema & { donorProfile: DonorProfileSchema, distance?: number })[];
  loading: boolean;
  error: string | null;
  findNearbyDonors: (
    latitude: number, 
    longitude: number, 
    bloodType: string, 
    maxDistanceKm?: number
  ) => Promise<void>;
  filterDonorsByBloodType: (bloodType: string) => Promise<void>;
  refreshDonors: () => Promise<void>;
}

export function useDonors(): UseDonors {
  const [donors, setDonors] = useState<(UserSchema & { donorProfile: DonorProfileSchema, distance?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all donors on mount
  useEffect(() => {
    loadAllDonors();
    
    // Set up real-time subscription to donors
    const unsubscribe = dbService.subscribe<UserSchema>(DB_PATHS.USERS, async (usersData) => {
      try {
        // Filter for donor users
        const donorUsers = usersData.filter(user => user.role === 'donor');
        
        // Get all donor profiles
        const donorProfiles = await dbService.getAll<DonorProfileSchema>(DB_PATHS.DONOR_PROFILES);
        
        // Match donors with their profiles
        const donorsWithProfiles = donorUsers.map(user => {
          const profile = donorProfiles.find(profile => profile.userId === user.id);
          if (profile) {
            return {
              ...user,
              donorProfile: profile
            };
          }
          return null;
        }).filter(Boolean) as (UserSchema & { donorProfile: DonorProfileSchema })[];
        
        setDonors(donorsWithProfiles);
      } catch (err) {
        console.error('Error in donor subscription:', err);
        setError('Failed to load donor data. Please try again.');
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Load all donors
  const loadAllDonors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all users with role = donor
      const users = await dbService.getAll<UserSchema>(DB_PATHS.USERS);
      const donorUsers = users.filter(user => user.role === 'donor');
      
      // Get all donor profiles
      const donorProfiles = await dbService.getAll<DonorProfileSchema>(DB_PATHS.DONOR_PROFILES);
      
      // Match donors with their profiles
      const donorsWithProfiles = donorUsers.map(user => {
        const profile = donorProfiles.find(profile => profile.userId === user.id);
        if (profile) {
          return {
            ...user,
            donorProfile: profile
          };
        }
        return null;
      }).filter(Boolean) as (UserSchema & { donorProfile: DonorProfileSchema })[];
      
      setDonors(donorsWithProfiles);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load donors. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Find donors near a location with specified blood type
  const findNearbyDonors = async (
    latitude: number, 
    longitude: number, 
    bloodType: string, 
    maxDistanceKm: number = 25
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the database service to find nearby donors
      const nearbyUsers = await dbService.findNearbyDonors(
        latitude, 
        longitude, 
        bloodType, 
        maxDistanceKm
      );
      
      // Get donor profiles for these users
      const donorProfiles = await dbService.getAll<DonorProfileSchema>(DB_PATHS.DONOR_PROFILES);
      
      // Match donors with their profiles and add distance information
      const nearbyDonors = nearbyUsers
        .map(user => {
          const profile = donorProfiles.find(profile => profile.userId === user.id);
          if (profile) {
            return {
              ...user,
              donorProfile: profile,
              distance: (user as any).distance // This was added by findNearbyDonors
            };
          }
          return null;
        })
        .filter(Boolean) as (UserSchema & { donorProfile: DonorProfileSchema, distance: number })[];
      
      setDonors(nearbyDonors);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find nearby donors. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter donors by blood type
  const filterDonorsByBloodType = async (bloodType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (bloodType === 'all') {
        await loadAllDonors();
        return;
      }
      
      // Get users with specified blood type
      const donorUsers = await dbService.getDonorsByBloodType(bloodType);
      
      // Get all donor profiles
      const donorProfiles = await dbService.getAll<DonorProfileSchema>(DB_PATHS.DONOR_PROFILES);
      
      // Match donors with their profiles
      const donorsWithProfiles = donorUsers.map(user => {
        const profile = donorProfiles.find(profile => profile.userId === user.id);
        if (profile) {
          return {
            ...user,
            donorProfile: profile
          };
        }
        return null;
      }).filter(Boolean) as (UserSchema & { donorProfile: DonorProfileSchema })[];
      
      setDonors(donorsWithProfiles);
    } catch (err: any) {
      const errorMessage = err.message || `Failed to load ${bloodType} donors. Please try again.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Refresh donors data
  const refreshDonors = async () => {
    await loadAllDonors();
  };

  return {
    donors,
    loading,
    error,
    findNearbyDonors,
    filterDonorsByBloodType,
    refreshDonors
  };
}
