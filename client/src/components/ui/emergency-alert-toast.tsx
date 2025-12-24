/**
 * Emergency Alert Toast Component
 * Displays real-time emergency blood request notifications
 */
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, X, MapPin, Clock, Droplet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergencyRequestAlerts, EmergencyRequestAlert } from '@/hooks/use-supabase-realtime';

interface EmergencyAlertToastProps {
    alert: EmergencyRequestAlert;
    onDismiss: () => void;
    onRespond?: (alert: EmergencyRequestAlert) => void;
}

/**
 * Individual alert toast
 */
export function EmergencyAlertToast({ alert, onDismiss, onRespond }: EmergencyAlertToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const urgencyStyles = {
        life_threatening: {
            bg: 'bg-red-600',
            border: 'border-red-700',
            text: 'text-white',
            badge: 'LIFE THREATENING',
        },
        critical: {
            bg: 'bg-red-500',
            border: 'border-red-600',
            text: 'text-white',
            badge: 'CRITICAL',
        },
        urgent: {
            bg: 'bg-amber-500',
            border: 'border-amber-600',
            text: 'text-white',
            badge: 'URGENT',
        },
        normal: {
            bg: 'bg-blue-500',
            border: 'border-blue-600',
            text: 'text-white',
            badge: 'NORMAL',
        },
    };

    const styles = urgencyStyles[alert.urgency] || urgencyStyles.normal;

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss();
        }, 300);
    };

    // Auto-dismiss after 30 seconds for non-critical alerts
    useEffect(() => {
        if (alert.urgency !== 'life_threatening' && alert.urgency !== 'critical') {
            const timer = setTimeout(handleDismiss, 30000);
            return () => clearTimeout(timer);
        }
    }, [alert.urgency]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 w-96 rounded-xl shadow-2xl overflow-hidden z-50',
                'transform transition-all duration-300 ease-out',
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
                styles.bg,
                styles.border,
                'border-2'
            )}
        >
            {/* Urgency badge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 animate-pulse" />

            <div className={cn('p-4', styles.text)}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wide opacity-90">
                            {styles.badge}
                        </span>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Blood type */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white text-red-600 rounded-lg px-3 py-2 font-bold text-xl shadow-lg">
                        {alert.bloodType}
                    </div>
                    <div>
                        <p className="font-semibold">Blood Required</p>
                        <p className="text-sm opacity-90">{alert.unitsNeeded} units needed</p>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm mb-3 opacity-90">
                    <MapPin className="w-4 h-4" />
                    <span>{alert.hospitalName}, {alert.hospitalCity}</span>
                </div>

                {/* Time remaining */}
                <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
                    <Clock className="w-4 h-4" />
                    <span>
                        Expires {new Date(alert.expiresAt).toLocaleDateString()} at{' '}
                        {new Date(alert.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-white/20 hover:bg-white/30 border-0"
                        onClick={handleDismiss}
                    >
                        Dismiss
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-white hover:bg-white/90 text-red-600 font-semibold border-0"
                        onClick={() => onRespond?.(alert)}
                    >
                        Respond
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Alert notification stack - displays multiple alerts
 */
interface EmergencyAlertStackProps {
    bloodType?: string | null;
    onRespond?: (alert: EmergencyRequestAlert) => void;
}

export function EmergencyAlertStack({ bloodType, onRespond }: EmergencyAlertStackProps) {
    const { alerts, latestAlert, dismissAlert, clearLatest } = useEmergencyRequestAlerts({
        bloodType,
        onNewAlert: (alert) => {
            // Play notification sound (optional)
            try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch { }
        },
    });

    if (!latestAlert) return null;

    return (
        <EmergencyAlertToast
            alert={latestAlert}
            onDismiss={clearLatest}
            onRespond={onRespond}
        />
    );
}

/**
 * Inventory alert banner for critical/low stock
 */
interface InventoryAlertBannerProps {
    criticalItems: Array<{
        bloodType: string;
        bloodBankName: string;
        unitsAvailable: number;
        status: 'critical' | 'low';
    }>;
    onDismiss?: () => void;
}

export function InventoryAlertBanner({ criticalItems, onDismiss }: InventoryAlertBannerProps) {
    if (criticalItems.length === 0) return null;

    const criticalCount = criticalItems.filter(i => i.status === 'critical').length;
    const lowCount = criticalItems.filter(i => i.status === 'low').length;

    return (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-2 px-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                    <p className="text-sm font-medium">
                        <span className="font-bold">Inventory Alert:</span>{' '}
                        {criticalCount > 0 && `${criticalCount} critical`}
                        {criticalCount > 0 && lowCount > 0 && ', '}
                        {lowCount > 0 && `${lowCount} low`}
                        {' '}blood type{(criticalCount + lowCount) > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-1">
                        {criticalItems.slice(0, 4).map((item, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-bold',
                                    item.status === 'critical'
                                        ? 'bg-red-700 text-white'
                                        : 'bg-amber-600 text-white'
                                )}
                            >
                                {item.bloodType}
                            </span>
                        ))}
                        {criticalItems.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                                +{criticalItems.length - 4}
                            </span>
                        )}
                    </div>
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default EmergencyAlertToast;
