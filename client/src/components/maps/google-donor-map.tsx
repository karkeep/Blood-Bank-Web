import { useState, useEffect } from 'react';
import { MapPin, Heart, Clock, User, Search, Phone, MessageCircle, Mail, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { contactAPI } from '@/lib/firebase/api';
import { useDonors } from '@/hooks/use-data';

// Blood type colors
const bloodTypeColors = {
  'O-': 'bg-red-600',
  'O+': 'bg-red-500', 
  'A-': 'bg-blue-600',
  'A+': 'bg-blue-500',
  'B-': 'bg-green-600', 
  'B+': 'bg-green-500',
  'AB-': 'bg-purple-600',
  'AB+': 'bg-purple-500'
};

export function GoogleDonorMap() {
  const { toast } = useToast();
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [contacting, setContacting] = useState(false);
  
  // Use the new real-time data hook
  const { donors, loading, error, refetch } = useDonors();
  
  // Filter donors based on selected blood type
  const filteredDonors = selectedBloodType === 'all' 
    ? donors 
    : donors.filter(donor => donor.bloodType === selectedBloodType);

  const handleContactDonor = async (donor, contactType) => {
    try {
      setContacting(true);
      
      // Send contact request to database
      await contactAPI.contactDonor(donor.id, contactType, `Contact request from Jiwandan user`);
      
      setSelectedDonor(null);
      
      const messages = {
        call: {
          title: "Call Request Sent",
          description: `Call request sent to ${donor.username || donor.name}. They'll contact you shortly.`
        },
        message: {
          title: "Message Sent",
          description: `Your message has been sent to ${donor.username || donor.name}.`
        },
        request: {
          title: "Blood Request Sent",
          description: `Emergency blood request sent to ${donor.username || donor.name}. Expected response within 30 minutes.`
        },
        email: {
          title: "Email Sent",
          description: `Email sent to ${donor.username || donor.name}. You'll receive a copy in your inbox.`
        }
      };
      
      toast({
        title: messages[contactType]?.title || "Request Sent",
        description: messages[contactType]?.description || "Your request has been sent successfully.",
      });
      
    } catch (error) {
      console.error('Error contacting donor:', error);
      toast({
        title: "Contact Failed",
        description: "Failed to send contact request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setContacting(false);
    }
  };

  return (
    <div className="w-full h-[450px] bg-gradient-to-br from-red-50 via-white to-red-50 border rounded-lg overflow-hidden relative">
      
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-sm text-gray-600">Loading donors...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="text-sm text-gray-600">{error}</span>
            <Button onClick={refetch} size="sm">
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Compact Map Header - Less Obtrusive */}
      <div className="absolute top-2 left-2 right-2 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="font-medium text-gray-800 text-sm">Find Donors</span>
            <div className="flex items-center space-x-1 ml-4">
              <Search className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">Kathmandu Valley</span>
            </div>
          </div>
          
          {/* Compact Blood Type Filter */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={selectedBloodType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedBloodType('all')}
              className="h-6 px-2 text-xs"
            >
              All
            </Button>
            {Object.keys(bloodTypeColors).slice(0, 4).map(type => (
              <Button
                key={type}
                size="sm"
                variant={selectedBloodType === type ? 'default' : 'outline'}
                onClick={() => setSelectedBloodType(type)}
                className={`h-6 px-2 text-xs ${selectedBloodType === type ? bloodTypeColors[type] + ' text-white' : ''}`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

          {/* Second Row for More Blood Types + Instructions */}
      <div className="absolute top-12 left-2 right-2 z-10 flex justify-between items-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-md border flex gap-1">
          {Object.keys(bloodTypeColors).slice(4).map(type => (
            <Button
              key={type}
              size="sm"
              variant={selectedBloodType === type ? 'default' : 'outline'}
              onClick={() => setSelectedBloodType(type)}
              className={`h-6 px-2 text-xs ${selectedBloodType === type ? bloodTypeColors[type] + ' text-white' : ''}`}
            >
              {type}
            </Button>
          ))}
        </div>
        
        {!selectedDonor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
            <span className="text-xs text-blue-700">Click on a donor marker to contact them</span>
          </div>
        )}
      </div>

      {/* Map Background with Grid */}
      <div 
        className="absolute inset-0 opacity-10 cursor-pointer" 
        onClick={() => selectedDonor && setSelectedDonor(null)}
      >
        <div className="grid grid-cols-12 grid-rows-8 h-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-gray-300"></div>
          ))}
        </div>
      </div>

      {/* Donor Markers */}
      <div className="absolute inset-0 p-4 pt-20">
        {!loading && !error && filteredDonors.map((donor, index) => {
          // Calculate position based on distance (closer donors appear closer to center)
          const distance = parseFloat((donor.distance || '1.0 km').toString());
          const centerX = 50; // Center percentage
          const centerY = 50;
          
          // Spread donors in a circle pattern based on their distance
          const angle = (index * 45) % 360; // Spread around circle
          const radiusMultiplier = Math.min(distance * 8, 35); // Max 35% from center
          
          const x = centerX + Math.cos(angle * Math.PI / 180) * radiusMultiplier;
          const y = centerY + Math.sin(angle * Math.PI / 180) * radiusMultiplier;
          
          // Get donor display name
          const donorName = donor.username || donor.fullName || donor.name || 'Anonymous Hero';
          const donorBloodType = donor.bloodType || 'O+';
          const donorStatus = donor.status || 'available';
          
          return (
            <div
              key={donor.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 hover:z-30 group ${
                selectedDonor?.id === donor.id ? 'z-20 scale-125' : 'z-10 hover:drop-shadow-lg'
              }`}
              style={{ 
                left: `${Math.max(10, Math.min(90, x))}%`, 
                top: `${Math.max(25, Math.min(85, y))}%` 
              }}
              onClick={(e) => {
                e.stopPropagation();
                const newSelectedDonor = selectedDonor?.id === donor.id ? null : donor;
                setSelectedDonor(newSelectedDonor);
                
                if (newSelectedDonor && !selectedDonor) {
                  toast({
                    title: "Donor Selected",
                    description: `${donorName} (${donorBloodType}) - ${donor.distance || 'Near you'}`,
                  });
                }
              }}
              title={`${donorName} - ${donorBloodType} blood type, ${donor.distance || 'Distance unknown'}`}
            >
              {/* Enhanced Donor Pin */}
              <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
                bloodTypeColors[donorBloodType] || 'bg-gray-500'
              } ${donorStatus === 'available' ? 'animate-pulse' : 'opacity-75'} ${
                selectedDonor?.id === donor.id ? 'ring-4 ring-blue-300' : ''
              }`}>
                {donorBloodType}
              </div>
              
              {/* Status Indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                donorStatus === 'available' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              
              {/* Distance Label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium whitespace-nowrap bg-white/80 px-1 rounded">
                {donor.distance || 'Near'}
              </div>

              {/* Hover Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {donorName} • {donorStatus === 'available' ? 'Available' : 'Busy'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Contact Panel */}
      {selectedDonor && (
        <div className="absolute right-2 top-2 bottom-2 w-72 md:w-80 bg-white rounded-lg shadow-xl border z-30 animate-in slide-in-from-right-2 max-w-[calc(100%-1rem)]">
          <div className="p-4 h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full ${bloodTypeColors[selectedDonor.bloodType] || 'bg-gray-500'} flex items-center justify-center text-white text-sm font-bold`}>
                  {selectedDonor.bloodType || 'O+'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedDonor.username || selectedDonor.fullName || selectedDonor.name || 'Anonymous Hero'}</h3>
                  <Badge variant={(selectedDonor.status || 'available') === 'available' ? 'default' : 'secondary'} className="text-xs">
                    {(selectedDonor.status || 'available') === 'available' ? 'Available Now' : 'Currently Busy'}
                  </Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedDonor(null)}
                className="h-6 w-6 p-0"
                disabled={contacting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Donor Info */}
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-medium">{selectedDonor.distance || 'Near you'}</span>
                  <p className="text-xs text-gray-500">Approximate distance</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-medium">Last donation: {selectedDonor.lastDonation || 'Unknown'}</span>
                  <p className="text-xs text-gray-500">Eligible for donation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <Heart className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="font-medium">{selectedDonor.donations || 0} total donations</span>
                  <p className="text-xs text-gray-500">Verified donor</p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedDonor.city && (
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">{selectedDonor.city}</span>
                    <p className="text-xs text-gray-500">Location</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Actions */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Contact Options:</div>
              
              <Button 
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
                onClick={() => handleContactDonor(selectedDonor, 'request')}
                disabled={selectedDonor.status === 'busy' || contacting}
              >
                {contacting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                <span>Send Blood Request</span>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => handleContactDonor(selectedDonor, 'call')}
                  disabled={contacting}
                >
                  {contacting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span>Call</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => handleContactDonor(selectedDonor, 'message')}
                  disabled={contacting}
                >
                  {contacting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  <span>Message</span>
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => handleContactDonor(selectedDonor, 'email')}
                disabled={contacting}
              >
                {contacting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>Send Email</span>
              </Button>
            </div>

            {/* Emergency Note */}
            {(selectedDonor.status || 'available') === 'available' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 text-center">
                  ✅ Available for emergency donation
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
        <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium whitespace-nowrap">
          Your Location
        </div>
      </div>

      {/* Your Location Marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
        <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium whitespace-nowrap">
          Your Location
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Blood Donors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Busy</span>
          </div>
        </div>
      </div>
      
      {/* Results Counter - Positioned to avoid side panel */}
      <div className={`absolute top-24 transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border ${
        selectedDonor ? 'right-80 md:right-96' : 'right-4'
      }`}>
        <div className="text-sm font-medium text-gray-700">
          {filteredDonors.length} donors found
        </div>
      </div>
    </div>
  );
}
