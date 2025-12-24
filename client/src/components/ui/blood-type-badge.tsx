import { cn } from '@/lib/utils';

interface BloodTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BloodTypeBadge = ({
  type,
  size = 'md',
  className,
}: BloodTypeBadgeProps) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'O-':
        return 'bg-red-600 border-red-700';
      case 'O+':
        return 'bg-red-500 border-red-600';
      case 'A-':
        return 'bg-blue-600 border-blue-700';
      case 'A+':
        return 'bg-blue-500 border-blue-600';
      case 'B-':
        return 'bg-green-600 border-green-700';
      case 'B+':
        return 'bg-green-500 border-green-600';
      case 'AB-':
        return 'bg-purple-600 border-purple-700';
      case 'AB+':
        return 'bg-purple-500 border-purple-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5 text-xs';
      case 'lg':
        return 'h-9 w-9 text-lg';
      case 'md':
      default:
        return 'h-7 w-7 text-sm';
    }
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white border',
        getSizeClasses(),
        getBackgroundColor(),
        className
      )}
    >
      {type}
    </div>
  );
};

export default BloodTypeBadge;