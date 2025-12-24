import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface GlassStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        label?: string;
        isPositive?: boolean; // Optionally override automatic positive/negative detection
    };
    variant?: 'default' | 'blood' | 'life' | 'warning' | 'success';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    animated?: boolean;
    onClick?: () => void;
}

/**
 * Premium glassmorphism stat card with depth effects
 * Features: Backdrop blur, gradient borders, glow effects, trend indicators
 */
export function GlassStatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = 'default',
    size = 'md',
    className,
    animated = true,
    onClick
}: GlassStatCardProps) {

    // Determine if trend is positive: use isPositive if provided, otherwise infer from value
    const isTrendPositive = trend?.isPositive !== undefined ? trend.isPositive : (trend?.value ?? 0) > 0;

    const variantStyles = {
        default: {
            bg: 'bg-white/70 dark:bg-gray-900/70',
            border: 'border-gray-200/50 dark:border-gray-700/50',
            iconBg: 'bg-gray-100 dark:bg-gray-800',
            iconColor: 'text-gray-600 dark:text-gray-400',
            glow: ''
        },
        blood: {
            bg: 'bg-gradient-to-br from-red-50/90 to-white/70 dark:from-red-950/50 dark:to-gray-900/70',
            border: 'border-red-200/50 dark:border-red-900/50',
            iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
            iconColor: 'text-white',
            glow: 'shadow-red-500/20'
        },
        life: {
            bg: 'bg-gradient-to-br from-green-50/90 to-white/70 dark:from-green-950/50 dark:to-gray-900/70',
            border: 'border-green-200/50 dark:border-green-900/50',
            iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
            iconColor: 'text-white',
            glow: 'shadow-green-500/20'
        },
        warning: {
            bg: 'bg-gradient-to-br from-amber-50/90 to-white/70 dark:from-amber-950/50 dark:to-gray-900/70',
            border: 'border-amber-200/50 dark:border-amber-900/50',
            iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
            iconColor: 'text-white',
            glow: 'shadow-amber-500/20'
        },
        success: {
            bg: 'bg-gradient-to-br from-emerald-50/90 to-white/70 dark:from-emerald-950/50 dark:to-gray-900/70',
            border: 'border-emerald-200/50 dark:border-emerald-900/50',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            iconColor: 'text-white',
            glow: 'shadow-emerald-500/20'
        }
    };

    const sizeStyles = {
        sm: {
            padding: 'p-4',
            iconSize: 'w-10 h-10',
            iconInner: 'w-5 h-5',
            valueSize: 'text-2xl',
            titleSize: 'text-xs'
        },
        md: {
            padding: 'p-5',
            iconSize: 'w-12 h-12',
            iconInner: 'w-6 h-6',
            valueSize: 'text-3xl',
            titleSize: 'text-sm'
        },
        lg: {
            padding: 'p-6',
            iconSize: 'w-14 h-14',
            iconInner: 'w-7 h-7',
            valueSize: 'text-4xl',
            titleSize: 'text-base'
        }
    };

    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    const TrendIcon = trend
        ? isTrendPositive ? TrendingUp : (!isTrendPositive && trend.value !== 0) ? TrendingDown : Minus
        : null;

    const trendColor = trend
        ? isTrendPositive ? 'text-green-500' : (!isTrendPositive && trend.value !== 0) ? 'text-red-500' : 'text-gray-400'
        : '';

    return (
        <div
            className={cn(
                // Base glass effect
                'relative rounded-2xl border backdrop-blur-xl overflow-hidden',
                'transition-all duration-300 ease-out',
                animated && 'hover:scale-[1.02] hover:shadow-xl',
                onClick && 'cursor-pointer',
                styles.bg,
                styles.border,
                styles.glow && `shadow-lg ${styles.glow}`,
                sizes.padding,
                className
            )}
            onClick={onClick}
        >
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                    <p className={cn('font-medium text-gray-500 dark:text-gray-400', sizes.titleSize)}>
                        {title}
                    </p>
                    <p className={cn('font-bold text-gray-900 dark:text-white tracking-tight', sizes.valueSize)}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>

                    {/* Trend indicator */}
                    {trend && (
                        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
                            {TrendIcon && <TrendIcon className="w-3 h-3" />}
                            <span>{Math.abs(trend.value)}%</span>
                            {trend.label && <span className="text-gray-400 ml-1">{trend.label}</span>}
                        </div>
                    )}

                    {/* Subtitle */}
                    {subtitle && !trend && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    )}
                </div>

                {/* Icon */}
                {Icon && (
                    <div className={cn(
                        'rounded-xl flex items-center justify-center shadow-lg',
                        styles.iconBg,
                        sizes.iconSize,
                        animated && 'group-hover:scale-110 transition-transform'
                    )}>
                        <Icon className={cn(styles.iconColor, sizes.iconInner)} />
                    </div>
                )}
            </div>

            {/* Subtle animated shine effect */}
            {animated && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}
        </div>
    );
}

/**
 * Stats grid layout component
 */
export function StatsGrid({
    children,
    columns = 4,
    className
}: {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}) {
    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={cn('grid gap-4', gridCols[columns], className)}>
            {children}
        </div>
    );
}

/**
 * Animated counter for stat values
 */
export function AnimatedCounter({
    value,
    duration = 1000,
    prefix = '',
    suffix = ''
}: {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}) {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        const startTime = Date.now();
        const startValue = displayValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.round(startValue + (value - startValue) * easedProgress);
            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}
