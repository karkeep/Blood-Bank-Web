import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import './city-map.css';

// Blood donor data with locations
const cityDonors = [
  { id: 1, lat: 27.7172, lng: 85.3240, type: 'O-', count: 5 },
  { id: 2, lat: 27.7050, lng: 85.3230, type: 'A+', count: 3 },
  { id: 3, lat: 27.7180, lng: 85.3320, type: 'B+', count: 4 },
  { id: 4, lat: 27.7260, lng: 85.3310, type: 'AB+', count: 2 },
  { id: 5, lat: 27.7150, lng: 85.3350, type: 'O+', count: 7 },
  { id: 6, lat: 27.7140, lng: 85.3140, type: 'A-', count: 1 },
  { id: 7, lat: 27.7090, lng: 85.3200, type: 'B-', count: 2 },
  { id: 8, lat: 27.7270, lng: 85.3280, type: 'AB-', count: 1 },
  // Cluster of O- donors
  { id: 9, lat: 27.7350, lng: 85.3400, type: 'O-', count: 12, isCluster: true }
];

// Hospital locations
const hospitals = [
  { id: 1, name: 'Central Hospital', lat: 27.7172, lng: 85.3270 },
  { id: 2, name: 'West Medical Center', lat: 27.7120, lng: 85.3180 },
  { id: 3, name: 'East General Hospital', lat: 27.7230, lng: 85.3350 }
];

// Blood bank locations
const bloodBanks = [
  { id: 1, name: 'City Blood Bank', lat: 27.7185, lng: 85.3255 },
  { id: 2, name: 'Regional Donation Center', lat: 27.7090, lng: 85.3300 }
];

export function CityDonorMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [activeType, setActiveType] = useState('all');
  const [donorMarkers, setDonorMarkers] = useState([]);
  const [hospitalMarkers, setHospitalMarkers] = useState([]);
  const [bloodBankMarkers, setBloodBankMarkers] = useState([]);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [isMapMoved, setIsMapMoved] = useState(false);
  
  // Blood type color mapping
  const bloodTypeColors = {
    'O-': '#d32f2f',
    'A+': '#e57373',
    'B+': '#81c784',
    'AB+': '#64b5f6',
    'O+': '#ffb74d',
    'A-': '#ef9a9a',
    'B-': '#a5d6a7',
    'AB-': '#90caf9',
    'cluster': '#6a1b9a'
  };
  
  // Load Google Maps
  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps) {
      setIsLoading(false);
      return;
    }

    // Define callback 
    window.initCityMap = () => {
      console.log("Google Maps API loaded for city map");
      setIsLoading(false);
    };
    
    // Load script
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDfyKE9MFSRdHfL-1i3ioYR51XWwV3AQ3Q&libraries=visualization,geometry&callback=initCityMap`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        setMapError("Failed to load Google Maps");
      };
      
      document.head.appendChild(script);
    } catch (err) {
      setMapError("Error initializing map");
    }
    
    // Cleanup
    return () => {
      window.initCityMap = undefined;
    };
  }, []);
  
  // Initialize map
  useEffect(() => {
    if (isLoading || !mapRef.current || mapInstance) return;
    
    try {
      // Custom map style for a stunning look
      const mapStyle = [
        {
          "elementType": "geometry",
          "stylers": [{ "color": "#f5f5f5" }]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#616161" }]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#f5f5f5" }]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#bdbdbd" }]
        },
        {
          "featureType": "administrative.neighborhood",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{ "color": "#eeeeee" }]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#757575" }]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{ "color": "#e5e5e5" }]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9e9e9e" }]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{ "color": "#ffffff" }]
        },
        {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#757575" }]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{ "color": "#dadada" }]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#616161" }]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9e9e9e" }]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [{ "color": "#e5e5e5" }]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [{ "color": "#eeeeee" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#c9c9c9" }]
        },
        {
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9e9e9e" }]
        }
      ];
      
      // Create map instance with custom styling
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 27.7172, lng: 85.3240 }, // Center on Kathmandu
        zoom: 14,
        styles: mapStyle,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        }
      });
      
      // Add custom controls to the map
      const controlDiv = document.createElement('div');
      controlDiv.className = 'blood-type-controls';
      
      // Create blood type filters
      const bloodTypes = ['all', 'O-', 'A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-'];
      bloodTypes.forEach(type => {
        const button = document.createElement('button');
        button.className = `blood-type-button ${type === 'all' ? 'active' : ''}`;
        button.textContent = type === 'all' ? 'All Types' : type;
        button.style.backgroundColor = type === 'all' ? '#ffffff' : `${bloodTypeColors[type]}20`;
        button.style.color = type === 'all' ? '#333333' : bloodTypeColors[type];
        button.style.borderColor = type === 'all' ? '#dddddd' : bloodTypeColors[type];
        
        button.addEventListener('click', () => {
          setActiveType(type);
          
          // Update active button styling
          document.querySelectorAll('.blood-type-button').forEach(btn => {
            btn.classList.remove('active');
          });
          button.classList.add('active');
          
          // Filter markers
          filterMarkers(type);
        });
        
        controlDiv.appendChild(button);
      });
      
      // Add legend control
      const legendDiv = document.createElement('div');
      legendDiv.className = 'map-legend';
      legendDiv.innerHTML = `
        <div class="legend-title">Map Legend</div>
        <div class="legend-item">
          <span class="legend-marker donor-marker"></span>
          <span>Individual Donors</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker cluster-marker"></span>
          <span>Donor Clusters</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker hospital-marker"></span>
          <span>Hospitals</span>
        </div>
        <div class="legend-item">
          <span class="legend-marker bloodbank-marker"></span>
          <span>Blood Banks</span>
        </div>
      `;
      
      // Add custom controls to the map
      map.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
      map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(legendDiv);
      
      // Set map instance
      setMapInstance(map);
      
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Create user marker with pulsing effect
            const userMarkerElement = document.createElement('div');
            userMarkerElement.className = 'user-location-marker';
            
            const userIcon = new window.google.maps.marker.AdvancedMarkerElement({
              position: userPos,
              map: map,
              content: userMarkerElement,
              title: 'Your Location'
            });
            
            setUserMarker(userIcon);
            
            // Create search radius
            const circle = new window.google.maps.Circle({
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#4285F4',
              fillOpacity: 0.1,
              map: map,
              center: userPos,
              radius: 1500, // 1.5km radius
              editable: true
            });
            
            setSearchRadius(circle);
            
            // Create heatmap for donor density
            const heatmapData = cityDonors.map(donor => {
              return {
                location: new window.google.maps.LatLng(donor.lat, donor.lng),
                weight: donor.count
              };
            });
            
            const heatmap = new window.google.maps.visualization.HeatmapLayer({
              data: heatmapData,
              map: map,
              radius: 50,
              opacity: 0.6,
              gradient: [
                'rgba(0, 0, 0, 0)',
                'rgba(255, 235, 235, 1)',
                'rgba(255, 210, 210, 1)',
                'rgba(255, 180, 180, 1)',
                'rgba(255, 160, 160, 1)',
                'rgba(255, 140, 140, 1)',
                'rgba(255, 120, 120, 1)',
                'rgba(255, 100, 100, 1)',
                'rgba(255, 80, 80, 1)',
                'rgba(255, 50, 50, 1)',
                'rgba(211, 47, 47, 1)'
              ]
            });
            
            setHeatmapLayer(heatmap);
            heatmap.setMap(null); // Hide initially
            
            // Add controls for heatmap toggle
            const heatmapButton = document.createElement('button');
            heatmapButton.className = 'heatmap-toggle';
            heatmapButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12" />
                <path d="M8 12h8" />
              </svg>
            `;
            heatmapButton.setAttribute('data-active', 'false');
            heatmapButton.title = 'Toggle Donor Density Heatmap';
            
            heatmapButton.addEventListener('click', () => {
              const isActive = heatmapButton.getAttribute('data-active') === 'true';
              heatmapButton.setAttribute('data-active', (!isActive).toString());
              heatmap.setMap(isActive ? null : map);
              
              heatmapButton.innerHTML = isActive ? 
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12" />
                  <path d="M8 12h8" />
                </svg>` :
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6" />
                  <path d="M9 9l6 6" />
                </svg>`;
            });
            
            map.controls[window.google.maps.ControlPosition.RIGHT_TOP].push(heatmapButton);
            
            // Fit map to include user location and donors
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userPos);
            cityDonors.forEach(donor => {
              bounds.extend({ lat: donor.lat, lng: donor.lng });
            });
            map.fitBounds(bounds);
          },
          (error) => {
            console.log("Error getting user location:", error);
          }
        );
      }
      
      // Add event listener for map movement
      map.addListener('center_changed', () => {
        setIsMapMoved(true);
      });
      
    } catch (err) {
      console.error("Error creating map:", err);
      setMapError("Failed to initialize interactive map");
    }
  }, [isLoading, mapInstance]);
  
  // Add markers to the map
  useEffect(() => {
    if (!mapInstance) return;
    
    try {
      // Create donor markers
      const newDonorMarkers = cityDonors.map(donor => {
        // Create marker with animated entrance
        const markerElement = document.createElement('div');
        markerElement.className = donor.isCluster ? 'animated-cluster-marker' : 'animated-donor-marker';
        markerElement.style.backgroundColor = donor.isCluster ? bloodTypeColors.cluster : bloodTypeColors[donor.type];
        
        if (donor.isCluster) {
          markerElement.innerHTML = `<span>${donor.count}</span>`;
        }
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: donor.lat, lng: donor.lng },
          map: mapInstance,
          content: markerElement,
          title: donor.isCluster ? 
            `Cluster of ${donor.count} donors with ${donor.type} blood type` : 
            `Donor with ${donor.type} blood type`
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
          // Create info window content
          const contentString = `
            <div class="donor-info-window">
              <div class="donor-info-header">
                <span class="donor-blood-type" style="background-color: ${bloodTypeColors[donor.type]}">${donor.type}</span>
                <h3>${donor.isCluster ? 'Donor Cluster' : 'Blood Donor'}</h3>
              </div>
              <div class="donor-info-content">
                ${donor.isCluster ? 
                  `<p><strong>${donor.count} donors</strong> with ${donor.type} blood type available in this area</p>` :
                  `<p>Anonymous donor with <strong>${donor.type}</strong> blood type</p>`
                }
                <p>Last donation: 3 weeks ago</p>
                <p>Status: <span class="verification-badge">✓ Verified</span></p>
              </div>
              <div class="donor-info-actions">
                <button class="donor-info-button primary">Request Donation</button>
                <button class="donor-info-button secondary">View Details</button>
              </div>
            </div>
          `;
          
          // Create and open info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: contentString,
            pixelOffset: new window.google.maps.Size(0, -10)
          });
          
          infoWindow.open({
            anchor: marker,
            map: mapInstance
          });
        });
        
        // Add data to marker for filtering
        marker.bloodType = donor.type;
        marker.isCluster = donor.isCluster;
        
        return marker;
      });
      
      setDonorMarkers(newDonorMarkers);
      
      // Create hospital markers
      const newHospitalMarkers = hospitals.map(hospital => {
        const hospitalElement = document.createElement('div');
        hospitalElement.className = 'hospital-marker';
        hospitalElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <line x1="12" y1="9" x2="12" y2="15" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
        `;
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: mapInstance,
          content: hospitalElement,
          title: hospital.name
        });
        
        // Add click event for info window
        marker.addListener('click', () => {
          const contentString = `
            <div class="hospital-info-window">
              <h3>${hospital.name}</h3>
              <p>Emergency blood needs:</p>
              <div class="blood-needs-container">
                <div class="blood-need urgent">
                  <span class="blood-type">O-</span>
                  <span class="blood-status">Urgent</span>
                </div>
                <div class="blood-need low">
                  <span class="blood-type">A+</span>
                  <span class="blood-status">Low</span>
                </div>
              </div>
              <button class="hospital-info-button">Contact Hospital</button>
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: contentString
          });
          
          infoWindow.open({
            anchor: marker,
            map: mapInstance
          });
        });
        
        return marker;
      });
      
      setHospitalMarkers(newHospitalMarkers);
      
      // Create blood bank markers
      const newBloodBankMarkers = bloodBanks.map(bloodBank => {
        const bloodBankElement = document.createElement('div');
        bloodBankElement.className = 'blood-bank-marker';
        bloodBankElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M12 9v7" />
            <path d="M9 12h6" />
          </svg>
        `;
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: bloodBank.lat, lng: bloodBank.lng },
          map: mapInstance,
          content: bloodBankElement,
          title: bloodBank.name
        });
        
        // Add click event for info window
        marker.addListener('click', () => {
          const contentString = `
            <div class="blood-bank-info-window">
              <h3>${bloodBank.name}</h3>
              <p>Current operating hours: 8:00 AM - 8:00 PM</p>
              <p>Accepting donations for all blood types</p>
              <button class="blood-bank-info-button">Schedule Donation</button>
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: contentString
          });
          
          infoWindow.open({
            anchor: marker,
            map: mapInstance
          });
        });
        
        return marker;
      });
      
      setBloodBankMarkers(newBloodBankMarkers);
      
    } catch (err) {
      console.error("Error adding markers:", err);
    }
  }, [mapInstance, bloodTypeColors]);
  
  // Function to filter markers by blood type
  const filterMarkers = (type) => {
    if (!donorMarkers.length) return;
    
    donorMarkers.forEach(marker => {
      if (type === 'all' || marker.bloodType === type) {
        marker.map = mapInstance;
      } else {
        marker.map = null;
      }
    });
  };
  
  // Function to reset map view
  const resetMapView = () => {
    if (!mapInstance) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    
    // Include user position if available
    if (userMarker) {
      bounds.extend(userMarker.position);
    }
    
    // Include visible donor markers
    donorMarkers.forEach(marker => {
      if (marker.map) {
        bounds.extend(marker.position);
      }
    });
    
    // Include hospitals and blood banks
    hospitalMarkers.forEach(marker => bounds.extend(marker.position));
    bloodBankMarkers.forEach(marker => bounds.extend(marker.position));
    
    mapInstance.fitBounds(bounds);
    setIsMapMoved(false);
  };
  
  return (
    <div className="city-map-container">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="city-map-canvas"
        aria-label="Interactive map showing blood donor locations"
      ></div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="pulsing-circle"></div>
          <Loader className="animate-spin h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600 font-medium">Loading Interactive Map...</p>
        </div>
      )}
      
      {/* Error State */}
      {mapError && (
        <div className="map-error-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-red-400 mb-2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" x2="9" y1="3" y2="18"></line>
            <line x1="15" x2="15" y1="6" y2="21"></line>
          </svg>
          <p className="text-red-600">{mapError}</p>
          <div className="location-marker" style={{backgroundColor: '#d32f2f', top: '40%', left: '30%'}}></div>
          <div className="location-marker" style={{backgroundColor: '#d32f2f', top: '35%', left: '32%'}}></div>
          <div className="location-marker" style={{backgroundColor: '#d32f2f', top: '42%', left: '28%'}}></div>
          <div className="cluster-marker" style={{top: '55%', left: '60%'}}>12</div>
          <div className="location-marker" style={{backgroundColor: '#2e7d32', top: '65%', left: '40%'}}></div>
          <div className="location-marker" style={{backgroundColor: '#2e7d32', top: '60%', left: '45%'}}></div>
          <div className="location-marker" style={{backgroundColor: '#1976d2', top: '50%', left: '70%'}}></div>
        </div>
      )}
      
      {/* Map Controls */}
      {!isLoading && !mapError && isMapMoved && (
        <button 
          className="reset-map-button" 
          onClick={resetMapView}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <path d="M17 12H7" />
            <path d="M11 8l-4 4 4 4" />
          </svg>
          Reset View
        </button>
      )}
    </div>
  );
}

// Add this to global.d.ts or in the component file
declare global {
  interface Window {
    initCityMap: () => void;
    google: any;
  }
}