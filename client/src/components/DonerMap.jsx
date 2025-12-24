import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

// Define your donor data type
interface Donor {
  id: string;
  latitude: number;
  longitude: number;
  bloodType: string;
  name?: string;
  distance?: number;
}

interface DonorMapProps {
  bloodType?: string;
  searchQuery?: string;
  height?: number;
  width?: string;
}

export function DonorMap({ 
  bloodType, 
  searchQuery,
  height = 350,
  width = "100%"
}: DonorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sample donor data - replace with API call in production
  const sampleDonors: Donor[] = [
    { id: '1', latitude: 40.712776, longitude: -74.005974, bloodType: 'O-', distance: 1.2 },
    { id: '2', latitude: 40.730610, longitude: -73.935242, bloodType: 'A+', distance: 2.5 },
    { id: '3', latitude: 40.728224, longitude: -74.077864, bloodType: 'A+', distance: 3.1 },
    { id: '4', latitude: 40.650002, longitude: -73.949997, bloodType: 'B+', distance: 5.4 },
    { id: '5', latitude: 40.579021, longitude: -74.151535, bloodType: 'B+', distance: 7.2 },
    { id: '6', latitude: 40.689247, longitude: -74.044502, bloodType: 'AB+', distance: 4.8 },
  ];

  // Function to get marker color based on blood type
  const getBloodTypeColor = (type: string): string => {
    switch(type) {
      case 'O-': return '#d32f2f';
      case 'A+': return '#e57373';
      case 'B+': return '#81c784';
      case 'AB+': return '#64b5f6';
      default: return '#ccc';
    }
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Define the global callback function
      window.initMap = () => {
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };

    // Check if Google Maps is already loaded
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      setLoading(false);
    }

    // Clean up
    return () => {
      // Remove the global callback
      delete window.initMap;
    };
  }, []);

  // Initialize map and add markers when Google Maps is loaded
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 40.712776, lng: -74.005974 }, // NYC as default
        zoom: 11,
        styles: [
          {
            featureType: "all",
            elementType: "all",
            stylers: [{ saturation: -20 }]
          }
        ],
        mapTypeControl: false,
        fullscreenControl: false
      });
    }

    // Filter donors based on bloodType
    let filteredDonors = sampleDonors;
    if (bloodType) {
      filteredDonors = sampleDonors.filter(donor => donor.bloodType === bloodType);
    }

    // Filter donors based on searchQuery (in a real app, this would be done on the server)
    if (searchQuery) {
      // This is a placeholder - in a real app you'd use geocoding to find donors near the searched location
      filteredDonors = filteredDonors.slice(0, 3); // Just showing fewer donors as a simple simulation
    }

    // Add markers for filtered donors
    filteredDonors.forEach(donor => {
      const marker = new google.maps.Marker({
        position: { lat: donor.latitude, lng: donor.longitude },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getBloodTypeColor(donor.bloodType),
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 8
        }
      });

      // Add info window with donor details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 5px;">
            <h3 style="margin: 0; font-size: 16px;">${donor.bloodType}</h3>
            <p style="margin: 5px 0 0 0;">${donor.distance} miles away</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Add cluster marker if we have enough donors
    if (filteredDonors.length > 3) {
      // Create a cluster marker at the average position of remaining donors
      const avgLat = filteredDonors.slice(3).reduce((sum, d) => sum + d.latitude, 0) / 
                    (filteredDonors.length - 3);
      const avgLng = filteredDonors.slice(3).reduce((sum, d) => sum + d.longitude, 0) / 
                    (filteredDonors.length - 3);
      
      // Create cluster marker element
      const clusterDiv = document.createElement('div');
      clusterDiv.innerHTML = `<div class="cluster-marker-el">${filteredDonors.length - 3}</div>`;
      const clusterElement = clusterDiv.firstChild as HTMLElement;
            
      const clusterMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: avgLat, lng: avgLng },
        map: mapRef.current,
        content: clusterElement
      });

      // Store reference to clean up later
      markersRef.current.push(clusterMarker as any);
    }

  }, [loading, bloodType, searchQuery]);

  return (
    <div 
      ref={mapContainerRef}
      className="map-container relative" 
      style={{ height: `${height}px`, width }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-gray-500">Loading map...</p>
        </div>
      )}
      
      <style jsx>{`
        .cluster-marker-el {
          background-color: #d32f2f;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

// Add this to your global.d.ts file or in the component file
declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}