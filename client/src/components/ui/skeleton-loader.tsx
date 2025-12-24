import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave' | 'shimmer';
}

/**
 * Premium skeleton loading with multiple animation variants
 */
export function Skeleton({
    className,
    variant = 'default',
    animation = 'shimmer'
}: SkeletonProps) {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700 relative overflow-hidden';

    const variantClasses = {
        default: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-none'
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton-wave',
        shimmer: 'skeleton-shimmer'
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
        />
    );
}

/**
 * Skeleton for stat cards on dashboard
 */
export function StatCardSkeleton() {
    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12" variant="circular" />
            </div>
        </div>
    );
}

/**
 * Skeleton for donor cards
 */
export function DonorCardSkeleton() {
    return (
        <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14" variant="circular" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-12 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for emergency request cards
 */
export function RequestCardSkeleton() {
    return (
        <div className="glass-card p-5 rounded-xl border-l-4 border-red-400">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    );
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Skeleton for inventory grid
 */
export function InventoryGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-xl text-center">
                    <Skeleton className="h-10 w-14 mx-auto mb-2" />
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for dashboard layout
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 rounded-xl">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                </div>
                <div>
                    <div className="glass-card p-6 rounded-xl space-y-4">
                        <Skeleton className="h-6 w-32" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8" variant="circular" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// CSS for skeleton animations (add to index.css)
export const skeletonStyles = `
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.skeleton-wave::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.dark .skeleton-shimmer::after,
.dark .skeleton-wave::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}
`;
