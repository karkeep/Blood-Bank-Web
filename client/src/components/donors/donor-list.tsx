import { useDonors, useContacts } from '@/hooks/use-data';
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Loader, MapPin, Clock, Award, Filter, MessageCircle, Heart } from 'lucide-react';
import { useState, useMemo } from 'react';

interface DonorListProps {
  bloodType?: string;
  searchQuery?: string;
  maxDistance?: number;
  availability?: string;
}

export function DonorList({ 
  bloodType, 
  searchQuery,
  maxDistance,
  availability
}: DonorListProps) {
  const { toast } = useToast();
  const { donors, loading, error } = useDonors();
  const { contactDonor, loading: contacting } = useContacts();
  const [contactingId, setContactingId] = useState(null);
  
  // Filter donors based on props
  const filteredDonors = useMemo(() => {
    let filtered = donors;
    
    // Filter by blood type
    if (bloodType && bloodType !== 'all') {
      filtered = filtered.filter(donor => donor.bloodType === bloodType);
    }
    
    // Filter by search query (location)
    if (searchQuery) {
      filtered = filtered.filter(donor => 
        donor.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by availability
    if (availability && availability !== 'any') {
      filtered = filtered.filter(donor => donor.status === 'available');
    }
    
    // Filter by distance
    if (maxDistance) {
      filtered = filtered.filter(donor => {
        const distance = parseFloat(donor.distance?.replace(' km', '') || '0');
        return distance <= maxDistance;
      });
    }
    
    return filtered;
  }, [donors, bloodType, searchQuery, maxDistance, availability]);

  const handleContactDonor = async (donor, contactType) => {
    try {
      setContactingId(donor.id);
      await contactDonor(donor.id, contactType, `Contact request from Jiwandan user`);
      
      toast({
        title: "Contact Request Sent",
        description: `Your ${contactType} request has been sent to the donor.`,
      });
    } catch (error) {
      toast({
        title: "Contact Failed",
        description: "Failed to contact donor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setContactingId(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-gray-500">Loading donors...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="mb-3 text-red-500">
          <Filter className="w-8 h-8" />
        </div>
        <p className="text-red-500">{error}</p>
        <p className="text-gray-500 mt-2">
          Please try different search criteria
        </p>
      </div>
    );
  }
  
  if (filteredDonors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
          <Filter className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-1">No donors found</h3>
        <p className="text-gray-500 text-center max-w-md mx-auto mb-4">
          We couldn't find any donors matching your criteria.
        </p>
        <div className="text-sm text-gray-500">
          {bloodType && bloodType !== 'all' ? `Blood type: ${bloodType}` : 'All blood types'} 
          {searchQuery ? ` near "${searchQuery}"` : ''}
        </div>
        <Button variant="outline" className="mt-4">Expand Search Radius</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 flex items-center text-sm mb-4">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            Showing <strong>{filteredDonors.length}</strong> donors
            {bloodType && bloodType !== 'all' ? ` with blood type ${bloodType}` : ''} 
            {searchQuery ? ` near "${searchQuery}"` : ''}
          </span>
        </div>
      </div>
      
      {filteredDonors.map(donor => (
        <Card key={donor.id} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <BloodTypeBadge type={donor.bloodType} size="lg" />
              </div>
              
              <div className="ml-4 flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{donor.username || 'Anonymous Donor'}</h3>
                    <p className="text-sm text-gray-500">
                      {donor.bloodType} Blood Type
                      {donor.verificationStatus === 'verified' && 
                        <span className="ml-2 text-green-600">✓ Verified</span>
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {donor.distance || 'Near you'}
                    </Badge>
                    <Badge 
                      variant={donor.status === 'available' ? 'default' : 'secondary'}
                      className={donor.status === 'available' ? 'bg-green-500' : ''}
                    >
                      {donor.status === 'available' ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{donor.donations || 0} donations</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    <span>Last: {donor.lastDonation || 'Never'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{donor.city || 'Location not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleContactDonor(donor, 'message')}
                disabled={contacting && contactingId === donor.id}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button 
                size="sm"
                onClick={() => handleContactDonor(donor, 'request')}
                disabled={contacting && contactingId === donor.id || donor.status !== 'available'}
              >
                <Heart className="w-4 h-4 mr-1" />
                Request Donation
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}