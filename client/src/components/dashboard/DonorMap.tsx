import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserSchema } from '@/lib/firebase/database';

interface DonorMapProps {
  donors: (UserSchema & { distance?: number })[];
  userLocation: {
    lat: number;
    lng: number;
  };
}

const DonorMap: React.FC<DonorMapProps> = ({ donors, userLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [selectedDonor, setSelectedDonor] = useState<UserSchema | null>(null);

  useEffect(() => {
    // This is a placeholder for actual Google Maps implementation
    // In a real app, you would initialize a map here
    setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
  }, []);

  return (
    <Card className="h-full">
      {!mapLoaded ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="h-64 bg-gray-100 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Map visualization would render here</p>
              <p className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                {donors.length} donors nearby
              </p>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Nearby Donors</h3>
            <div className="max-h-40 overflow-y-auto">
              {donors.slice(0, 5).map((donor, index) => (
                <div 
                  key={donor.id || index} 
                  className="flex justify-between items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => setSelectedDonor(donor)}
                >
                  <div>
                    <p className="text-sm font-medium">{donor.username}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1 text-xs">
                        {donor.bloodType}
                      </Badge>
                      {donor.distance && (
                        <span>{donor.distance.toFixed(1)} km away</span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      donor.role === 'donor' && donor.status === 'Available' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-yellow-50 text-yellow-700'
                    }
                  >
                    {donor.role === 'donor' && donor.status === 'Available' ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default DonorMap;
