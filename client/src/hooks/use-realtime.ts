import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { realtimeAPI, donorAPI, bloodRequestAPI } from '@/lib/firebase/api';

// Custom hook for real-time notifications
export function useRealtimeNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let previousRequests = [];
    let previousDonors = [];

    // Subscribe to emergency requests for new request notifications
    const unsubscribeRequests = realtimeAPI.subscribeToEmergencyRequests((requests) => {
      if (previousRequests.length > 0) {
        // Check for new requests
        const newRequests = requests.filter(req => 
          !previousRequests.some(prevReq => prevReq.id === req.id)
        );

        newRequests.forEach(request => {
          if (request.urgencyLevel === 'critical') {
            toast({
              title: "🚨 Critical Blood Request",
              description: `${request.bloodType} blood needed urgently at ${request.hospital}`,
              variant: "destructive",
            });
          }

          // Add to notifications
          const notification = {
            id: `req_${request.id}`,
            type: 'emergency_request',
            title: 'New Emergency Request',
            message: `${request.bloodType} blood needed at ${request.hospital}`,
            timestamp: new Date().toISOString(),
            read: false,
            urgency: request.urgencyLevel
          };
          
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      }
      previousRequests = requests;
    });
    // Subscribe to donor status changes
    const unsubscribeDonors = realtimeAPI.subscribeToDonors((donors) => {
      if (previousDonors.length > 0) {
        // Check for donors who became available
        const newlyAvailable = donors.filter(donor => 
          donor.status === 'available' && 
          previousDonors.some(prevDonor => 
            prevDonor.id === donor.id && prevDonor.status !== 'available'
          )
        );

        if (newlyAvailable.length > 0) {
          toast({
            title: "✅ Donors Available",
            description: `${newlyAvailable.length} donor(s) are now available`,
          });
        }
      }
      previousDonors = donors;
    });

    return () => {
      unsubscribeRequests();
      unsubscribeDonors();
    };
  }, [toast]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications
  };
}