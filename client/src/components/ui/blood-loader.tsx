import React from 'react';
import { cn } from '@/lib/utils';

interface BloodDropLoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

/**
 * Premium animated blood drop loader
 * Features: Pulsing drop with ripple effect and gradient fill
 */
export function BloodDropLoader({ size = 'md', className, text }: BloodDropLoaderProps) {
    const sizeClasses = {
        sm: 'w-8 h-10',
        md: 'w-12 h-16',
        lg: 'w-16 h-20',
        xl: 'w-24 h-32'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    return (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <div className="relative">
                {/* Ripple effects */}
                <div className="absolute inset-0 animate-ping opacity-20">
                    <svg viewBox="0 0 24 32" className={cn(sizeClasses[size], 'fill-red-500')}>
                        <path d="M12 0C12 0 0 14 0 21C0 27 5.5 32 12 32C18.5 32 24 27 24 21C24 14 12 0 12 0Z" />
                    </svg>
                </div>

                {/* Main blood drop with gradient */}
                <svg viewBox="0 0 24 32" className={cn(sizeClasses[size], 'relative z-10 animate-bounce')}>
                    <defs>
                        <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#dc2626" />
                            <stop offset="100%" stopColor="#991b1b" />
                        </linearGradient>
                        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Drop shadow */}
                    <ellipse cx="12" cy="30" rx="6" ry="1.5" fill="rgba(0,0,0,0.2)" className="animate-pulse" />

                    {/* Main drop body */}
                    <path
                        d="M12 0C12 0 0 14 0 21C0 27 5.5 32 12 32C18.5 32 24 27 24 21C24 14 12 0 12 0Z"
                        fill="url(#bloodGradient)"
                    />

                    {/* Shine highlight */}
                    <path
                        d="M8 10C8 10 4 16 4 20C4 23 6 25 8 25C10 25 11 23 11 21C11 18 8 10 8 10Z"
                        fill="url(#shineGradient)"
                    />

                    {/* Small bubble highlight */}
                    <circle cx="7" cy="18" r="1.5" fill="white" opacity="0.6" />
                </svg>

                {/* Pulsing glow */}
                <div className="absolute inset-0 -z-10 blur-xl animate-pulse">
                    <svg viewBox="0 0 24 32" className={cn(sizeClasses[size], 'fill-red-500 opacity-30')}>
                        <path d="M12 0C12 0 0 14 0 21C0 27 5.5 32 12 32C18.5 32 24 27 24 21C24 14 12 0 12 0Z" />
                    </svg>
                </div>
            </div>

            {/* Loading text with shimmer */}
            {text && (
                <div className={cn('relative overflow-hidden', textSizes[size])}>
                    <span className="text-gray-600 font-medium">{text}</span>
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
            )}
        </div>
    );
}

/**
 * Heartbeat loader with ECG line animation
 */
export function HeartbeatLoader({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center gap-4', className)}>
            {/* Animated heart */}
            <div className="relative">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500 animate-heartbeat">
                    <path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                </svg>
                <div className="absolute inset-0 animate-ping opacity-30">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500">
                        <path
                            fill="currentColor"
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        />
                    </svg>
                </div>
            </div>

            {/* ECG Line */}
            <svg viewBox="0 0 100 40" className="w-24 h-8">
                <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,20 20,20 25,20 30,5 35,35 40,20 45,20 100,20"
                    className="animate-ecg"
                />
            </svg>
        </div>
    );
}

/**
 * Page-level loading screen with blood drop animation
 */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50">
            <div className="flex flex-col items-center gap-6">
                <BloodDropLoader size="xl" />
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">{message}</p>
                    <p className="text-sm text-gray-500 mt-1">Connecting lives through donation</p>
                </div>
            </div>
        </div>
    );
}

// Add CSS animations to index.css
export const loaderAnimationStyles = `
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

@keyframes ecg {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-heartbeat {
  animation: heartbeat 1.2s ease-in-out infinite;
}

.animate-ecg {
  stroke-dasharray: 200;
  animation: ecg 2s linear infinite;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;
