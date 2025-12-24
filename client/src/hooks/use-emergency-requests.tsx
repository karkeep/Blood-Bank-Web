import { useState, useEffect } from 'react';
import { dbService, EmergencyRequestSchema, DB_PATHS, UserSchema } from '@/lib/firebase/database';

// Define the return type for our hook
interface UseEmergencyRequests {
  emergencyRequests: EmergencyRequestSchema[];
  activeRequests: EmergencyRequestSchema[];
  userRequests: EmergencyRequestSchema[];
  loading: boolean;
  error: string | null;
  createEmergencyRequest: (requestData: Partial<EmergencyRequestSchema>) => Promise<EmergencyRequestSchema>;
  updateEmergencyRequest: (id: string, requestData: Partial<EmergencyRequestSchema>) => Promise<EmergencyRequestSchema>;
  cancelEmergencyRequest: (id: string) => Promise<void>;
  getUserRequests: (userId: string) => Promise<EmergencyRequestSchema[]>;
  getRequestDetails: (id: string) => Promise<EmergencyRequestSchema | null>;
  getActiveEmergencyRequests: () => Promise<EmergencyRequestSchema[]>;
}

export function useEmergencyRequests(userId?: string): UseEmergencyRequests {
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequestSchema[]>([]);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequestSchema[]>([]);
  const [userRequests, setUserRequests] = useState<EmergencyRequestSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load emergency requests on mount and set up real-time subscription
  useEffect(() => {
    loadEmergencyRequests();
    
    // Set up real-time subscription to emergency requests
    const unsubscribe = dbService.subscribe<EmergencyRequestSchema>(
      DB_PATHS.EMERGENCY_REQUESTS, 
      (requestsData) => {
        setEmergencyRequests(requestsData);
        
        // Filter for active requests
        const now = Date.now();
        const active = requestsData.filter(req => 
          req.expiresAt > now && 
          ['Pending', 'Matching'].includes(req.status)
        );
        setActiveRequests(active);
        
        // Filter for current user's requests if userId provided
        if (userId) {
          const userReqs = requestsData.filter(req => req.requesterId === userId);
          setUserRequests(userReqs);
        }
      }
    );
    
    // Clean up subscription
    return () => unsubscribe();
  }, [userId]);

  // Load all emergency requests
  const loadEmergencyRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requests = await dbService.getAll<EmergencyRequestSchema>(DB_PATHS.EMERGENCY_REQUESTS);
      setEmergencyRequests(requests);
      
      // Filter for active requests
      const now = Date.now();
      const active = requests.filter(req => 
        req.expiresAt > now && 
        ['Pending', 'Matching'].includes(req.status)
      );
      setActiveRequests(active);
      
      // Filter for current user's requests if userId provided
      if (userId) {
        const userReqs = requests.filter(req => req.requesterId === userId);
        setUserRequests(userReqs);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load emergency requests. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new emergency request
  const createEmergencyRequest = async (requestData: Partial<EmergencyRequestSchema>): Promise<EmergencyRequestSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate expiration time (default to 24 hours from now)
      const expiresAt = requestData.expiresAt || Date.now() + 24 * 60 * 60 * 1000;
      
      // Create request in database
      const requestId = await dbService.create<Partial<EmergencyRequestSchema>>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        {
          ...requestData,
          status: 'Pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt
        }
      );
      
      // Get the created request
      const newRequest = await dbService.get<EmergencyRequestSchema>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        requestId
      );
      
      if (!newRequest) throw new Error('Request created but could not be retrieved');
      
      // Create notification for the requester
      await dbService.createNotification({
        userId: newRequest.requesterId,
        title: 'Emergency Request Created',
        message: `Your emergency request for ${newRequest.bloodType} blood has been created.`,
        type: 'EmergencyRequest',
        read: false,
        relatedEntityId: newRequest.id,
        relatedEntityType: 'EmergencyRequest'
      });
      
      // Find and notify potential donors
      if (newRequest.latitude && newRequest.longitude) {
        await notifyNearbyDonors(newRequest);
      }
      
      return newRequest;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create emergency request. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update emergency request
  const updateEmergencyRequest = async (
    id: string, 
    requestData: Partial<EmergencyRequestSchema>
  ): Promise<EmergencyRequestSchema> => {
    setLoading(true);
    setError(null);
    
    try {
      // Update request in database
      await dbService.update<EmergencyRequestSchema>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        id, 
        {
          ...requestData,
          updatedAt: Date.now()
        }
      );
      
      // Get the updated request
      const updatedRequest = await dbService.get<EmergencyRequestSchema>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        id
      );
      
      if (!updatedRequest) throw new Error('Request updated but could not be retrieved');
      
      return updatedRequest;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update emergency request. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel emergency request
  const cancelEmergencyRequest = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Update request status to Cancelled
      await dbService.update<EmergencyRequestSchema>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        id, 
        {
          status: 'Cancelled',
          updatedAt: Date.now()
        }
      );
      
      // Get the request data to create notification
      const request = await dbService.get<EmergencyRequestSchema>(
        DB_PATHS.EMERGENCY_REQUESTS, 
        id
      );
      
      if (request) {
        // Create notification for the requester
        await dbService.createNotification({
          userId: request.requesterId,
          title: 'Emergency Request Cancelled',
          message: `Your emergency request for ${request.bloodType} blood has been cancelled.`,
          type: 'EmergencyRequest',
          read: false,
          relatedEntityId: request.id,
          relatedEntityType: 'EmergencyRequest'
        });
        
        // Notify assigned donors if any
        if (request.donorIds && request.donorIds.length > 0) {
          for (const donorId of request.donorIds) {
            await dbService.createNotification({
              userId: donorId,
              title: 'Emergency Request Cancelled',
              message: `An emergency request for ${request.bloodType} blood you were matched with has been cancelled.`,
              type: 'EmergencyRequest',
              read: false,
              relatedEntityId: request.id,
              relatedEntityType: 'EmergencyRequest'
            });
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel emergency request. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's emergency requests
  const getUserRequests = async (userId: string): Promise<EmergencyRequestSchema[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const requests = await dbService.getAll<EmergencyRequestSchema>(DB_PATHS.EMERGENCY_REQUESTS);
      const userRequests = requests.filter(req => req.requesterId === userId);
      setUserRequests(userRequests);
      return userRequests;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load your emergency requests. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get emergency request details
  const getRequestDetails = async (id: string): Promise<EmergencyRequestSchema | null> => {
    setLoading(true);
    setError(null);
    
    try {
      return await dbService.get<EmergencyRequestSchema>(DB_PATHS.EMERGENCY_REQUESTS, id);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load request details. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get active emergency requests
  const getActiveEmergencyRequests = async (): Promise<EmergencyRequestSchema[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const active = await dbService.getActiveEmergencyRequests();
      setActiveRequests(active);
      return active;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load active emergency requests. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to notify nearby donors
  const notifyNearbyDonors = async (request: EmergencyRequestSchema): Promise<void> => {
    try {
      // Find donors within 25km with matching blood type
      const nearbyDonors = await dbService.findNearbyDonors(
        request.latitude,
        request.longitude,
        request.bloodType,
        25
      );
      
      // Create notification for each potential donor
      for (const donor of nearbyDonors) {
        await dbService.createNotification({
          userId: donor.id,
          title: 'Emergency Blood Request Nearby',
          message: `There's an urgent need for ${request.bloodType} blood type within your area.`,
          type: 'EmergencyRequest',
          read: false,
          relatedEntityId: request.id,
          relatedEntityType: 'EmergencyRequest'
        });
      }
    } catch (error) {
      console.error('Error notifying nearby donors:', error);
    }
  };

  return {
    emergencyRequests,
    activeRequests,
    userRequests,
    loading,
    error,
    createEmergencyRequest,
    updateEmergencyRequest,
    cancelEmergencyRequest,
    getUserRequests,
    getRequestDetails,
    getActiveEmergencyRequests
  };
}
