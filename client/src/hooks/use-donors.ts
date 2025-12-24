import { useState, useEffect } from 'react';
import ENV from '../env';

export interface Donor {
  id: string;
  name?: string;
  bloodType: string;
  latitude: number;
  longitude: number;
  distance?: number;
  verificationStatus?: string;
  lastDonation?: string;
  numberOfDonations?: number;
  availability?: string;
}

interface UseDonorsProps {
  bloodType?: string;
  searchQuery?: string;
  maxDistance?: number;
  availability?: string;
}

export function useDonors({ 
  bloodType, 
  searchQuery,
  maxDistance = 25,
  availability = 'any'
}: UseDonorsProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would be an API call to your backend
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data with coordinates from different parts of the world
        // In DEV_MODE we'll use this, in production this would come from an API
        const mockDonors: Donor[] = [
          { 
            id: '1', 
            bloodType: 'O-', 
            latitude: 27.7172, 
            longitude: 85.3240, 
            distance: 0.5, 
            verificationStatus: 'Verified',
            lastDonation: '2 months ago',
            numberOfDonations: 8,
            availability: 'now'
          },
          { 
            id: '2', 
            bloodType: 'A+', 
            latitude: 27.7271, 
            longitude: 85.3100, 
            distance: 1.2, 
            verificationStatus: 'Verified',
            lastDonation: '6 months ago',
            numberOfDonations: 4,
            availability: 'today'
          },
          { 
            id: '3', 
            bloodType: 'B+', 
            latitude: 27.7350, 
            longitude: 85.3170, 
            distance: 2.1, 
            verificationStatus: 'Pending',
            lastDonation: '1 year ago',
            numberOfDonations: 2,
            availability: 'week'
          },
          { 
            id: '4', 
            bloodType: 'AB+', 
            latitude: 27.7155, 
            longitude: 85.3380, 
            distance: 1.5, 
            verificationStatus: 'Verified',
            lastDonation: '3 months ago',
            numberOfDonations: 6,
            availability: 'now'
          },
          { 
            id: '5', 
            bloodType: 'O+', 
            latitude: 27.7080, 
            longitude: 85.3200, 
            distance: 0.9, 
            verificationStatus: 'Verified',
            lastDonation: '4 months ago',
            numberOfDonations: 5,
            availability: 'today'
          },
          { 
            id: '6', 
            bloodType: 'A-', 
            latitude: 27.7250, 
            longitude: 85.3300, 
            distance: 1.8, 
            verificationStatus: 'Verified',
            lastDonation: '2 months ago',
            numberOfDonations: 7,
            availability: 'now'
          },
          { 
            id: '7', 
            bloodType: 'B-', 
            latitude: 27.7150, 
            longitude: 85.3100, 
            distance: 0.7, 
            verificationStatus: 'Pending',
            lastDonation: '5 months ago',
            numberOfDonations: 3,
            availability: 'week'
          },
          { 
            id: '8', 
            bloodType: 'AB-', 
            latitude: 27.7200, 
            longitude: 85.3350, 
            distance: 1.3, 
            verificationStatus: 'Verified',
            lastDonation: '1 month ago', 
            numberOfDonations: 9,
            availability: 'now'
          }
        ];

        // Filter by blood type if specified
        let filteredDonors = mockDonors;
        if (bloodType && bloodType !== 'all') {
          filteredDonors = filteredDonors.filter(donor => donor.bloodType === bloodType);
        }

        // Filter by availability if specified
        if (availability && availability !== 'any') {
          filteredDonors = filteredDonors.filter(donor => donor.availability === availability);
        }

        // Filter by max distance
        if (maxDistance) {
          filteredDonors = filteredDonors.filter(donor => 
            donor.distance && donor.distance <= maxDistance
          );
        }

        // If search query exists, simulate filtering to results closer to searched location
        // In a real app, geocoding would be used to find donors near the searched location
        if (searchQuery && searchQuery.trim() !== '') {
          // For demo, just reduce the results to simulate different results for different queries
          filteredDonors = filteredDonors.slice(0, Math.max(3, filteredDonors.length - searchQuery.length));
        }

        setDonors(filteredDonors);
      } catch (error) {
        console.error('Error fetching donors:', error);
        setError('Failed to load donors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonors();
  }, [bloodType, searchQuery, maxDistance, availability]);

  return { donors, isLoading, error };
}