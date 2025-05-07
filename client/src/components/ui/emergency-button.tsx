import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useLocation } from "wouter";

interface EmergencyButtonProps {
  className?: string;
  fixed?: boolean;
}

export function EmergencyButton({ className, fixed = true }: EmergencyButtonProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation('/emergency');
  };
  
  return (
    <div className={cn(
      fixed && "fixed right-6 bottom-6 z-10",
      className
    )}>
      <Button 
        onClick={handleClick}
        size="lg"
        variant="destructive"
        className="emergency-button rounded-full py-3 px-6 shadow-lg flex items-center gap-2"
      >
        <Heart className="h-5 w-5" fill="currentColor" />
        <span>Emergency Request</span>
      </Button>
    </div>
  );
}
