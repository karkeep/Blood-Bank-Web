import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { EmergencyRequestSchema } from '@/lib/firebase/database';
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Hospital 
} from 'lucide-react';

interface EmergencyRequestCardProps {
  request: EmergencyRequestSchema;
  isCompatible: boolean;
}

const EmergencyRequestCard: React.FC<EmergencyRequestCardProps> = ({ 
  request, 
  isCompatible 
}) => {
  const [, navigate] = useLocation();
  
  // Calculate time remaining until expiry
  const getTimeRemaining = () => {
    if (!request.expiresAt) return 'Unknown';
    
    const now = new Date();
    const expiryDate = new Date(request.expiresAt);
    const diffMs = expiryDate.getTime() - now.getTime();
    
    // If already expired
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} left`;
    }
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m left`;
    }
    
    return `${diffMinutes} min left`;
  };

  return (
    <Card className={
      isCompatible 
        ? 'border-primary-500 shadow-md' 
        : 'border-gray-200'
    }>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Emergency Request
          </CardTitle>
          <Badge variant={
            request.urgency === 'Critical' ? 'destructive' : 
            request.urgency === 'Urgent' ? 'default' : 'secondary'
          }>
            {request.urgency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Blood Type Needed:</span>
            <Badge variant="outline" className="text-base px-3">
              {request.bloodType}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Hospital className="w-4 h-4 mr-2" />
            {request.hospitalName}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {request.hospitalCity}, {request.hospitalState}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            {getTimeRemaining()}
          </div>
          
          {isCompatible && (
            <div className="mt-2 p-2 bg-primary-50 rounded-md text-sm">
              <p className="font-medium text-primary-700">
                Your blood type is compatible with this request!
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col gap-2">
          {isCompatible && request.status !== 'Completed' && (
            <Button className="w-full">Respond to Request</Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate(`/requests/${request.id}`)}>
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmergencyRequestCard;
