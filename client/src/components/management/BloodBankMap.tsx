import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Home, Droplet, Info } from 'lucide-react';

const BloodBankMap = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [selectedBloodBank, setSelectedBloodBank] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  
  // Initialize the map on component mount
  useEffect(() => {
    fetchBloodBanks();
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Default to Kathmandu if location access is denied
          setUserLocation({ lat: 27.7172, lng: 85.3240 });
        }
      );
    } else {
      // Default to Kathmandu if geolocation is not supported
      setUserLocation({ lat: 27.7172, lng: 85.3240 });
    }
    
    // Initialize the map
    const initMap = () => {
      if (window.google && !map) {
        try {
          // Default center (Kathmandu)
          const defaultCenter = { lat: 27.7172, lng: 85.3240 };
          const center = userLocation || defaultCenter;
          
          const mapOptions = {
            center,
            zoom: 13,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          };
          
          const mapInstance = new window.google.maps.Map(
            document.getElementById('blood-bank-map'),
            mapOptions
          );
          
          setMap(mapInstance);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    };
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);
  
  // Update map when user location changes
  useEffect(() => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      
      // Add marker for user location
      new window.google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'Your Location'
      });
    }
  }, [map, userLocation]);
  
  // Update markers when blood banks or filter changes
  useEffect(() => {
    if (map && bloodBanks.length > 0) {
      // Clear previous markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];
      
      // Filter blood banks based on blood type
      const filteredBanks = bloodTypeFilter === 'all'
        ? bloodBanks
        : bloodBanks.filter(bb => {
            const levels = bb.inventoryLevels || {};
            return levels[bloodTypeFilter] > 0;
          });
      
      // Add markers for blood banks
      filteredBanks.forEach(bb => {
        if (bb.latitude && bb.longitude) {
          const position = { lat: bb.latitude, lng: bb.longitude };
          
          // Create marker
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: bb.name,
            icon: {
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              fillColor: bb.status === 'active' ? '#DC2626' : '#9CA3AF',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 1,
              labelOrigin: new window.google.maps.Point(0, -30)
            }
          });
          
          // Create info window for marker
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${bb.name}</h3>
                <p class="text-sm">${bb.address}, ${bb.city}</p>
                <p class="text-sm">${bb.phone}</p>
                ${bb.status === 'active' 
                  ? '<p class="text-xs mt-1 text-green-600">Active</p>' 
                  : '<p class="text-xs mt-1 text-red-600">Inactive</p>'
                }
              </div>
            `
          });
          
          // Add click listener to marker
          marker.addListener('click', () => {
            // Close any open info windows
            markers.forEach(m => m.infoWindow?.close());
            
            // Open this info window
            infoWindow.open(map, marker);
            marker.infoWindow = infoWindow;
            
            // Set selected blood bank
            setSelectedBloodBank(bb);
          });
          
          marker.infoWindow = infoWindow;
          newMarkers.push(marker);
        }
      });
      
      setMarkers(newMarkers);
      
      // Fit map to markers if there are any
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
        
        // Also include user location in bounds
        if (userLocation) {
          bounds.extend(userLocation);
        }
        
        map.fitBounds(bounds);
        
        // Zoom out a bit
        const zoom = map.getZoom();
        map.setZoom(zoom > 15 ? 15 : zoom);
      }
    }
  }, [map, bloodBanks, bloodTypeFilter, userLocation]);
  
  // Fetch blood banks from API
  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bloodbanks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blood banks');
      }
      
      const data = await response.json();
      setBloodBanks(data);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      
      // Generate mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockData = [
          {
            id: 1,
            name: 'City Hospital Blood Bank',
            address: '123 Main Street',
            city: 'Kathmandu',
            phone: '+977-1-4123456',
            email: 'blood@cityhospital.com',
            website: 'https://cityhospital.com',
            latitude: 27.7172,
            longitude: 85.3240,
            status: 'active',
            inventoryLevels: {
              'A+': 50,
              'A-': 20,
              'B+': 35,
              'B-': 15,
              'AB+': 10,
              'AB-': 5,
              'O+': 75,
              'O-': 25,
            },
            createdBy: 1,
            createdAt: '2025-05-18T12:00:00.000Z',
            updatedAt: '2025-05-18T12:00:00.000Z'
          },
          {
            id: 2,
            name: 'Red Cross Blood Center',
            address: '456 Hospital Road',
            city: 'Pokhara',
            phone: '+977-61-5234567',
            email: 'blood@redcross.org.np',
            website: 'https://redcross.org.np',
            latitude: 28.2096,
            longitude: 83.9856,
            status: 'active',
            inventoryLevels: {
              'A+': 40,
              'A-': 15,
              'B+': 45,
              'B-': 10,
              'AB+': 5,
              'AB-': 3,
              'O+': 60,
              'O-': 20,
            },
            createdBy: 1,
            createdAt: '2025-05-17T10:00:00.000Z',
            updatedAt: '2025-05-17T10:00:00.000Z'
          }
        ];
        
        setBloodBanks(mockData);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Render blood bank details
  const renderBloodBankDetails = () => {
    if (!selectedBloodBank) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
          <MapPin className="h-12 w-12 mb-2 opacity-20" />
          <p>Select a blood bank from the map to view details</p>
        </div>
      );
    }
    
    const inventoryLevels = selectedBloodBank.inventoryLevels || {};
    
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{selectedBloodBank.name}</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-2 mt-0.5 text-slate-400" />
            <div>
              <p>{selectedBloodBank.address}</p>
              <p>{selectedBloodBank.city}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-slate-400" />
            <p>{selectedBloodBank.phone}</p>
          </div>
          
          {selectedBloodBank.email && (
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-slate-400" />
              <div>
                <p>{selectedBloodBank.email}</p>
                {selectedBloodBank.website && (
                  <a 
                    href={selectedBloodBank.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedBloodBank.website}
                  </a>
                )}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Blood Inventory</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <div 
                  key={type}
                  className={`border rounded-md p-2 text-center ${
                    (inventoryLevels[type] || 0) < 10 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-bold text-lg">{type}</div>
                  <div className={`text-sm ${
                    (inventoryLevels[type] || 0) < 10 ? 'text-red-600' : ''
                  }`}>
                    {inventoryLevels[type] || 0} units
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <Badge className={
              selectedBloodBank.status === 'active' ? 'bg-green-600' : 'bg-red-600'
            }>
              {selectedBloodBank.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Blood Bank Map</h1>
      
      <div className="mb-4">
        <Tabs defaultValue="all" onValueChange={setBloodTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="A+">A+</TabsTrigger>
            <TabsTrigger value="A-">A-</TabsTrigger>
            <TabsTrigger value="B+">B+</TabsTrigger>
            <TabsTrigger value="B-">B-</TabsTrigger>
            <TabsTrigger value="AB+">AB+</TabsTrigger>
            <TabsTrigger value="AB-">AB-</TabsTrigger>
            <TabsTrigger value="O+">O+</TabsTrigger>
            <TabsTrigger value="O-">O-</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader className="p-4">
              <CardTitle>Find Blood Banks Near You</CardTitle>
              <CardDescription>
                Click on a marker to view blood bank details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div id="blood-bank-map" style={{ width: '100%', height: '520px' }}>
                {!map && (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-[600px]">
            <CardHeader className="p-4">
              <CardTitle>Blood Bank Details</CardTitle>
              <CardDescription>
                Information about the selected blood bank
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[520px] overflow-y-auto">
                {renderBloodBankDetails()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BloodBankMap;