import { memo } from "react";
import { Droplets } from "lucide-react";

interface JiwandanLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  animated?: boolean;
  className?: string;
}

export const JiwandanLogo = memo(function JiwandanLogo({
  size = "md",
  withText = false,
  animated = true,
  className = ""
}: JiwandanLogoProps) {

  const containerSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Red rounded square with droplets */}
      <div
        className={`inline-flex items-center justify-center ${containerSizes[size]} bg-red-600 rounded-2xl shadow-lg ${animated ? 'hover:scale-105 transition-transform' : ''}`}
      >
        <Droplets className={`${iconSizes[size]} text-white`} />
      </div>

      {/* Text Logo */}
      {withText && (
        <div className="flex flex-col">
          <span className={`font-bold text-red-700 leading-tight ${textSizes[size]}`}>
            Jiwandan
          </span>
          <span className="text-xs text-red-500 font-medium tracking-wider uppercase">
            जीवनदान
          </span>
        </div>
      )}
    </div>
  );
});

// Enhanced version with more sophisticated design
export const JiwandanLogoEnhanced = memo(function JiwandanLogoEnhanced({
  size = "md",
  withText = false,
  animated = true,
  className = ""
}: JiwandanLogoProps) {

  const containerSizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Enhanced Logo Icon - Red rounded square with droplets and shadow */}
      <div
        className={`inline-flex items-center justify-center ${containerSizes[size]} bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-xl ${animated ? 'hover:scale-105 hover:shadow-2xl transition-all duration-300' : ''}`}
      >
        <Droplets className={`${iconSizes[size]} text-white drop-shadow-sm`} />
      </div>

      {/* Enhanced Text Logo */}
      {withText && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-red-700 via-red-600 to-red-700 bg-clip-text text-transparent leading-tight ${textSizes[size]}`}>
            Jiwandan
          </span>
          <div className="flex flex-col -mt-1">
            <span className="text-sm text-red-500 font-medium tracking-wider">
              जीवनदान
            </span>
            <span className="text-xs text-red-400 font-light tracking-wide">
              Gift of Life
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
