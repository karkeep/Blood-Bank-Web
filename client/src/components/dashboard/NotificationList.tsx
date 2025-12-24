import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
  createdAt: number;
}

interface NotificationListProps {
  notifications: Notification[];
  markAsRead?: (id: string) => void;
  markAllAsRead?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  markAsRead,
  markAllAsRead
}) => {
  // Helper function to format timestamp
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2">{unreadCount} new</Badge>
            )}
          </CardTitle>
          {markAllAsRead && unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-md ${
                  !notification.read ? 'bg-muted/40' : ''
                } border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge variant={notification.read ? 'outline' : 'default'}>
                    {notification.read ? 'Read' : 'New'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(notification.createdAt)}
                  </div>
                  {!notification.read && markAsRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6 px-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationList;
