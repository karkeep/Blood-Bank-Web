import { Donor } from '@/hooks/use-donors';
import { Card } from "@/components/ui/card";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Award } from 'lucide-react';

interface DonorGridProps {
  donors: Donor[];
  bloodType?: string;
  searchQuery?: string;
}

export function DonorGrid({ donors, bloodType, searchQuery }: DonorGridProps) {
  if (donors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No donors found matching your criteria.</p>
        <p className="text-sm text-gray-400">
          {bloodType && bloodType !== 'all' ? `Blood type: ${bloodType}` : 'All blood types'} 
          {searchQuery ? ` near "${searchQuery}"` : ''}
        </p>
        <Button variant="outline" className="mt-4">Expand Search Area</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {donors.map((donor) => (
        <Card key={donor.id} className="overflow-hidden">
          <div className="flex p-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <BloodTypeBadge type={donor.bloodType} size="lg" />
            </div>
            
            <div className="ml-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Anonymous Donor</h3>
                  <p className="text-sm text-gray-500">{donor.bloodType} Blood Type</p>
                </div>
                
                {donor.verificationStatus === 'Verified' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{donor.distance} km away</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  <span>Last donated {donor.lastDonation}</span>
                </div>
                
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{donor.numberOfDonations} donations</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t p-3 bg-gray-50 flex justify-end">
            <Button variant="outline" size="sm" className="mr-2">Message</Button>
            <Button size="sm">Request</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}