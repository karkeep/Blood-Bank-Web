import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    Heart,
    Droplet,
    MapPin,
    Clock,
    User,
    AlertTriangle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'donation' | 'request' | 'match' | 'achievement' | 'registration' | 'fulfillment';
    title: string;
    description: string;
    time?: string;
    timestamp?: Date;
    location?: string;
    bloodType?: string;
    isNew?: boolean;
}

interface LiveActivityFeedProps {
    activities?: ActivityItem[];
    maxItems?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
    className?: string;
}

/**
 * Format a Date as a relative time string (e.g., "2 mins ago")
 */
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

/**
 * Real-time activity feed with animated entries
 */
export function LiveActivityFeed({
    activities = [],
    maxItems = 5,
    autoRefresh = true,
    refreshInterval = 30000,
    className
}: LiveActivityFeedProps) {
    const [items, setItems] = useState<ActivityItem[]>(activities);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Simulate real-time updates
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            setLastUpdate(new Date());
            // In production, this would fetch from Supabase real-time subscription
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval]);

    useEffect(() => {
        setItems(activities.slice(0, maxItems));
    }, [activities, maxItems]);

    const getActivityIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'donation':
                return { icon: Droplet, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
            case 'request':
                return { icon: AlertTriangle, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' };
            case 'match':
                return { icon: Heart, color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' };
            case 'achievement':
                return { icon: Sparkles, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' };
            case 'registration':
                return { icon: User, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' };
            default:
                return { icon: CheckCircle2, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' };
        }
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Header with live indicator */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-gray-500">Live</span>
                </div>
            </div>

            {/* Activity list */}
            <div className="space-y-2">
                {items.map((activity, index) => {
                    const { icon: Icon, color } = getActivityIcon(activity.type);

                    return (
                        <div
                            key={activity.id}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-xl',
                                'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
                                'border border-gray-100 dark:border-gray-700/50',
                                'transition-all duration-300',
                                'hover:bg-white/80 dark:hover:bg-gray-800/80',
                                'hover:shadow-md hover:scale-[1.01]',
                                activity.isNew && 'animate-slide-in ring-2 ring-green-500/30'
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon */}
                            <div className={cn('p-2 rounded-lg shrink-0', color)}>
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {activity.description}
                                        </p>
                                    </div>

                                    {/* Blood type badge */}
                                    {activity.bloodType && (
                                        <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-full shrink-0">
                                            {activity.bloodType}
                                        </span>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {activity.time || (activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Just now')}
                                    </span>
                                    {activity.location && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            {activity.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Droplet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No recent activity</p>
                    </div>
                )}
            </div>

            {/* Last updated */}
            <p className="text-xs text-gray-400 text-center">
                Updated {lastUpdate.toLocaleTimeString()}
            </p>
        </div>
    );
}

/**
 * Sample activity data generator
 */
export function generateSampleActivities(): ActivityItem[] {
    const now = new Date();

    return [
        {
            id: '1',
            type: 'donation',
            title: 'New Donation Completed',
            description: 'Ram Sharma donated 450ml of blood at Kathmandu Medical Center',
            time: '2 mins ago',
            location: 'Kathmandu',
            bloodType: 'A+',
            isNew: true
        },
        {
            id: '2',
            type: 'request',
            title: 'Emergency Request',
            description: 'Urgent need for B- blood at Bir Hospital',
            time: '5 mins ago',
            location: 'Kathmandu',
            bloodType: 'B-'
        },
        {
            id: '3',
            type: 'match',
            title: 'Donor Matched',
            description: 'Sita Devi matched with emergency request #2845',
            time: '10 mins ago',
            location: 'Patan'
        },
        {
            id: '4',
            type: 'achievement',
            title: 'Gold Badge Earned',
            description: 'Hari Prasad achieved Gold donor status!',
            time: '15 mins ago'
        },
        {
            id: '5',
            type: 'registration',
            title: 'New Donor Registered',
            description: 'Welcome Maya Thapa to the Jiwandan community',
            time: '20 mins ago',
            location: 'Bhaktapur',
            bloodType: 'O+'
        }
    ];
}

// CSS for animations (add to index.css)
export const activityFeedStyles = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
`;
