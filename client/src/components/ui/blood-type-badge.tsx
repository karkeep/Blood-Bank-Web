import { cn } from "@/lib/utils";

export type BloodType = 
  | "A+" | "A-" 
  | "B+" | "B-" 
  | "AB+" | "AB-" 
  | "O+" | "O-";

interface BloodTypeBadgeProps {
  type: BloodType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BloodTypeBadge({ type, className, size = "md" }: BloodTypeBadgeProps) {
  // Convert blood type to CSS class format
  const typeToClass = (type: BloodType) => {
    const formatted = type
      .toLowerCase()
      .replace("+", "pos")
      .replace("-", "neg");
    return `blood-type-${formatted}`;
  };
  
  // Determine size class
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base"
  }[size];

  return (
    <div 
      className={cn(
        "blood-type",
        typeToClass(type),
        sizeClass,
        className
      )}
    >
      {type}
    </div>
  );
}
