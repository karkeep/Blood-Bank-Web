import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

interface BloodTypeSelectorProps {
    value?: BloodType;
    onChange?: (type: BloodType) => void;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
}

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Interactive blood type selector with 3D-style cells
 */
export function BloodTypeSelector({
    value,
    onChange,
    size = 'md',
    animated = true,
    className
}: BloodTypeSelectorProps) {
    const [hoveredType, setHoveredType] = useState<BloodType | null>(null);

    const sizeClasses = {
        sm: 'w-10 h-10 text-xs',
        md: 'w-14 h-14 text-sm',
        lg: 'w-20 h-20 text-lg'
    };

    const handleSelect = (type: BloodType) => {
        onChange?.(type);

        // Trigger confetti for selection
        if (animated) {
            confetti({
                particleCount: 30,
                spread: 40,
                origin: { y: 0.6 },
                colors: ['#ef4444', '#dc2626', '#fca5a5']
            });
        }
    };

    return (
        <div className={cn('grid grid-cols-4 gap-3', className)}>
            {BLOOD_TYPES.map((type) => {
                const isSelected = value === type;
                const isHovered = hoveredType === type;

                return (
                    <button
                        key={type}
                        onClick={() => handleSelect(type)}
                        onMouseEnter={() => setHoveredType(type)}
                        onMouseLeave={() => setHoveredType(null)}
                        className={cn(
                            'relative rounded-xl font-bold',
                            'transition-all duration-300 ease-out',
                            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                            sizeClasses[size],
                            // 3D effect styles
                            'transform-gpu',
                            isSelected ? [
                                'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
                                'text-white shadow-xl shadow-red-500/40',
                                'scale-110 -translate-y-1',
                                'ring-2 ring-red-400'
                            ] : [
                                'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
                                'text-gray-700 dark:text-gray-300',
                                'border border-gray-200 dark:border-gray-700',
                                'hover:border-red-300 dark:hover:border-red-700',
                                isHovered && animated && 'scale-105 -translate-y-0.5 shadow-lg'
                            ]
                        )}
                    >
                        {/* Blood cell shape overlay */}
                        <div className={cn(
                            'absolute inset-0 rounded-xl overflow-hidden',
                            isSelected && 'blood-cell-animate'
                        )}>
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            )}
                        </div>

                        {/* Type label */}
                        <span className="relative z-10">{type}</span>

                        {/* Pulse effect for selected */}
                        {isSelected && animated && (
                            <span className="absolute inset-0 rounded-xl bg-red-400 opacity-0 animate-ping" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Confetti celebration for achievements
 */
export function triggerAchievementConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Since particles fall down, start from top corners
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#ef4444', '#dc2626', '#fca5a5', '#fee2e2', '#ffffff']
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#22c55e', '#16a34a', '#86efac', '#dcfce7', '#ffffff']
        });
    }, 250);
}

/**
 * Achievement celebration component
 */
export function AchievementCelebration({
    title,
    description,
    badge,
    points,
    onClose
}: {
    title: string;
    description: string;
    badge: string;
    points: number;
    onClose?: () => void;
}) {
    React.useEffect(() => {
        triggerAchievementConfetti();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-bounce-in">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 blur-xl" />

                <div className="relative text-center">
                    {/* Badge icon */}
                    <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                        <span className="text-4xl">{badge}</span>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {description}
                    </p>

                    {/* Points earned */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            +{points} points
                        </span>
                    </div>

                    {/* Close button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all hover:shadow-lg"
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// CSS animations (add to index.css)
export const celebrationStyles = `
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.blood-cell-animate::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%);
  animation: cell-rotate 3s linear infinite;
}

@keyframes cell-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
