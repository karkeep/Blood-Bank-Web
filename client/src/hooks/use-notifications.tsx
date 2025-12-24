import { useState, useEffect } from 'react';
import { dbService, NotificationSchema, DB_PATHS } from '@/lib/firebase/database';

// Define the return type for our hook
interface UseNotifications {
  notifications: NotificationSchema[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

export function useNotifications(userId?: string): UseNotifications {
  const [notifications, setNotifications] = useState<NotificationSchema[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications on mount and set up real-time subscription
  useEffect(() => {
    if (userId) {
      loadNotificationsForUser(userId);
      
      // Set up real-time subscription to the user's notifications
      const unsubscribe = dbService.subscribe<NotificationSchema>(
        DB_PATHS.NOTIFICATIONS, 
        (notificationsData) => {
          // Filter for current user's notifications
          const userNotifications = notificationsData
            .filter(n => n.userId === userId)
            .sort((a, b) => b.createdAt - a.createdAt);
          
          setNotifications(userNotifications);
          
          // Calculate unread count
          const unread = userNotifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      );
      
      // Clean up subscription
      return () => unsubscribe();
    }
  }, [userId]);

  // Load notifications for a specific user
  const loadNotificationsForUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userNotifications = await dbService.getUserNotifications(userId);
      setNotifications(userNotifications);
      
      // Calculate unread count
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load notifications. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await dbService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrease unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark notification as read. Please try again.';
      setError(errorMessage);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get unread notifications
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Mark each notification as read
      for (const notification of unreadNotifications) {
        await dbService.markNotificationAsRead(notification.id);
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark all notifications as read. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications (for refresh)
  const loadNotifications = async (): Promise<void> => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    
    await loadNotificationsForUser(userId);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadNotifications
  };
}
