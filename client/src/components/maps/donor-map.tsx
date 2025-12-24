import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader as LoaderIcon, Map } from 'lucide-react';
import { useDonors } from '@/hooks/use-donors';
import { DonorGrid } from '@/components/donors/donor-grid';
import './map.css';

interface DonorMapProps {
  bloodType?: string;
  searchQuery?: string;
  height?: number;
  width?: string;
  maxDistance?: number;
  availability?: string;
}

export function DonorMap({ 
  bloodType, 
  searchQuery,
  height = 350,
  width = "100%",
  maxDistance,
  availability
}: DonorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Get donors from the hook
  const { donors, isLoading: donorsLoading, error: donorsError } = useDonors({ 
    bloodType, 
    searchQuery,
    maxDistance,
    availability
  });

  // Function to get marker color based on blood type
  const getBloodTypeColor = (type: string): string => {
    switch(type) {
      case 'O-': return '#d32f2f'; // Universal donor - deep red
      case 'A+': return '#e57373'; // Light red
      case 'B+': return '#81c784'; // Green
      case 'AB+': return '#64b5f6'; // Blue
      case 'O+': return '#ffb74d'; // Orange
      case 'A-': return '#ef9a9a'; // Lighter red
      case 'B-': return '#a5d6a7'; // Lighter green
      case 'AB-': return '#90caf9'; // Lighter blue
      default: return '#ccc';
    }
  };

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  }, [markers]);

  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log("Got user location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Error getting location:", error.message);
          // Default to Kathmandu if location access is denied
          setUserLocation({ lat: 27.7172, lng: 85.3240 });
        }
      );
    } else {
      // Geolocation not supported, use default
      setUserLocation({ lat: 27.7172, lng: 85.3240 });
    }
  }, []);

  // Load Google Maps API
  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    
    // If initMap is already defined, just make sure it calls our setter
    if (window.initMap) {
      const originalInitMap = window.initMap;
      window.initMap = () => {
        originalInitMap();
        setGoogleMapsLoaded(true);
      };
      return;
    }
    
    // Define the global callback function
    window.initMap = () => {
      console.log("Google Maps API loaded");
      setGoogleMapsLoaded(true);
    };
    
    // Only load the script once
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      try {
        // Load Google Maps (using a demo API key - replace with your own in production)
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDfyKE9MFSRdHfL-1i3ioYR51XWwV3AQ3Q&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        // Handle script errors
        script.onerror = () => {
          console.error("Failed to load Google Maps API");
          setMapError("Failed to load Google Maps API");
        };
        
        document.head.appendChild(script);
        console.log("Google Maps script added to document");
      } catch (err) {
        console.error("Error adding Google Maps script:", err);
        setMapError("Error loading map resources");
      }
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current || mapInstance) return;
    
    try {
      console.log("Creating new Google Map instance");
      const mapOptions: google.maps.MapOptions = {
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapId: "ebe804d512255797", // Use a custom map style ID
        // Use a cleaner map style
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };
      
      // If we have user location, use it as center
      if (userLocation) {
        mapOptions.center = userLocation;
      } else {
        // Default to Kathmandu
        mapOptions.center = { lat: 27.7172, lng: 85.3240 };
      }
      
      const newMap = new window.google.maps.Map(
        mapContainerRef.current,
        mapOptions
      );
      
      setMapInstance(newMap);
      console.log("Map successfully created");
    } catch (err) {
      console.error("Error creating map:", err);
      setMapError("Failed to initialize map");
    }
  }, [googleMapsLoaded, mapInstance, userLocation]);

  // Update markers when donors or filters change
  useEffect(() => {
    if (!mapInstance || donorsLoading || donors.length === 0) return;
    
    try {
      // Clear previous markers
      clearMarkers();
      
      // Add new markers
      const newMarkers: google.maps.Marker[] = [];
      const bounds = new window.google.maps.LatLngBounds();
      
      // If we have user location, add it to bounds and create a user marker
      if (userLocation) {
        bounds.extend(userLocation);
        
        // Add user location marker
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#1976d2',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 10
          },
          zIndex: 100, // Ensure user marker is above other markers
          title: 'Your Location'
        });
        
        newMarkers.push(userMarker);
        
        // Add info window for user location
        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 5px;">
              <h3 style="margin: 0; font-size: 16px; color: #1976d2;">Your Location</h3>
            </div>
          `
        });
        
        userMarker.addListener('click', () => {
          userInfoWindow.open(mapInstance, userMarker);
        });
      }
      
      // Add donor markers
      donors.forEach(donor => {
        if (!donor.latitude || !donor.longitude) return;
        
        const position = { lat: donor.latitude, lng: donor.longitude };
        bounds.extend(position);
        
        // Create marker with custom style based on blood type
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: getBloodTypeColor(donor.bloodType),
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 8
          },
          title: `${donor.bloodType} Blood Donor`
        });
        
        // Create info window with donor details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 150px;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; display: flex; align-items: center;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${getBloodTypeColor(donor.bloodType)}; margin-right: 5px;"></span>
                ${donor.bloodType} Blood Type
              </h3>
              <p style="margin: 5px 0; font-size: 14px;">
                <strong>${donor.distance} km</strong> from your location
              </p>
              <p style="margin: 5px 0; font-size: 13px; color: #666;">
                Last donation: ${donor.lastDonation || 'Unknown'}
              </p>
              ${donor.verificationStatus === 'Verified' ? 
                `<p style="margin: 5px 0 0 0; font-size: 13px; color: green; display: flex; align-items: center;">
                  <span style="font-size: 15px; margin-right: 3px;">✓</span> Verified Donor
                </p>` : ''
              }
              <div style="margin-top: 8px; font-size: 12px; text-align: right;">
                <a href="#" style="color: #1976d2; text-decoration: none;">Contact Donor</a>
              </div>
            </div>
          `
        });
        
        // Open info window when marker is clicked
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });
        
        newMarkers.push(marker);
      });
      
      // Store all markers
      setMarkers(newMarkers);
      
      // Adjust map bounds to show all markers
      if (newMarkers.length > 0) {
        mapInstance.fitBounds(bounds);
        
        // Add listener to prevent zooming in too far
        const listener = window.google.maps.event.addListener(mapInstance, "idle", () => {
          if (mapInstance.getZoom()! > 16) mapInstance.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
    } catch (err) {
      console.error("Error updating markers:", err);
      setMapError("Error displaying donors on map");
    }
  }, [mapInstance, donors, donorsLoading, bloodType, searchQuery, clearMarkers, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);
  
  // Detect Google Maps errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("Google") || 
        event.message?.includes("google") || 
        event.message?.includes("maps") ||
        event.message?.includes("Unexpected token") ||
        event.message?.includes("JSON")
      ) {
        console.error("Google Maps error detected:", event.message);
        setMapError("Map error detected");
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div 
      className="relative"
      style={{ height: `${height}px`, width, overflow: 'hidden' }}
    >
      {/* Map container */}
      <div 
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
      />
      
      {/* Loading indicator */}
      {(donorsLoading || (!googleMapsLoaded && !mapError)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <LoaderIcon className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-gray-500">
            {donorsLoading ? "Finding donors..." : "Loading map..."}
          </p>
        </div>
      )}

      {/* No donors found message */}
      {!donorsLoading && donors.length === 0 && !donorsError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-90 z-10">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
            <Map className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No donors found</h3>
          <p className="text-gray-500 text-center max-w-xs mb-4">
            We couldn't find any donors matching your criteria in this area.
          </p>
          <div className="text-sm text-gray-500">
            {bloodType && bloodType !== 'all' ? `Blood type: ${bloodType}` : 'All blood types'} 
            {searchQuery ? ` near "${searchQuery}"` : ''}
          </div>
        </div>
      )}

      {/* Donor error */}
      {donorsError && !donorsLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-75 z-10">
          <Map className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-red-500">{donorsError}</p>
          <p className="text-gray-500 mt-2">
            {bloodType && bloodType !== 'all' ? `Showing ${bloodType} donors` : 'Showing all blood donors'}
            {searchQuery ? ` near "${searchQuery}"` : ''}
          </p>
        </div>
      )}

      {/* Map error or not initialized properly */}
      {(mapError || (googleMapsLoaded && !mapInstance && donors.length > 0)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="w-full max-w-4xl p-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Map view unavailable</strong> - Showing donor grid instead. You can also try the List View tab for a different view of donors.
                </span>
              </p>
            </div>
            
            <DonorGrid 
              donors={donors} 
              bloodType={bloodType} 
              searchQuery={searchQuery}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// TypeScript type declarations
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}