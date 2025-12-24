import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
    MapPin, Heart, Clock, Phone, MessageCircle, Mail, Loader2, AlertCircle, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { contactAPI } from '@/lib/firebase/api';
import { useDonors } from '@/hooks/use-data';

// Blood type colors for markers
const bloodTypeColors: Record<string, string> = {
    'O-': '#dc2626',
    'O+': '#ef4444',
    'A-': '#2563eb',
    'A+': '#3b82f6',
    'B-': '#16a34a',
    'B+': '#22c55e',
    'AB-': '#9333ea',
    'AB+': '#a855f7'
};

const mapContainerStyle = {
    width: '100%',
    height: '450px'
};

// Center on Kathmandu Valley (where donors are actually registered)
const nepalCenter = {
    lat: 27.7172,
    lng: 85.3240
};

// City coordinates for Nepal
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'kathmandu': { lat: 27.7172, lng: 85.3240 },
    'lalitpur': { lat: 27.6588, lng: 85.3247 },
    'bhaktapur': { lat: 27.6710, lng: 85.4298 },
    'pokhara': { lat: 28.2096, lng: 83.9856 },
    'biratnagar': { lat: 26.4525, lng: 87.2718 },
    'birgunj': { lat: 27.0104, lng: 84.8821 },
    'default': { lat: 27.7172, lng: 85.3240 }
};

interface RealGoogleDonorMapProps {
    bloodTypeFilter?: string;
}

export function RealGoogleDonorMap({ bloodTypeFilter = 'all' }: RealGoogleDonorMapProps) {
    const { toast } = useToast();
    const { donors, loading, error, refetch } = useDonors();
    const [selectedDonor, setSelectedDonor] = useState<any>(null);
    const [contacting, setContacting] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Load Google Maps API
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        id: 'google-map-script'
    });

    // Filter donors
    const filteredDonors = useMemo(() => {
        if (bloodTypeFilter === 'all') return donors;
        return donors.filter(donor => donor.bloodType === bloodTypeFilter);
    }, [donors, bloodTypeFilter]);

    // Generate positions for donors based on their city or stored coordinates
    const donorsWithPositions = useMemo(() => {
        return filteredDonors.map((donor, index) => {
            // Use real coordinates if available
            if (donor.latitude && donor.longitude) {
                return {
                    ...donor,
                    position: { lat: donor.latitude, lng: donor.longitude }
                };
            }

            // Otherwise, place in their city with some spread
            const city = (donor.city || 'kathmandu').toLowerCase();
            const baseCoords = cityCoordinates[city] || cityCoordinates['default'];

            // Add some randomization so markers don't overlap
            const angle = (index * 37) % 360;
            const radius = 0.008 + (index % 5) * 0.004; // Spread markers around the city

            return {
                ...donor,
                position: {
                    lat: baseCoords.lat + Math.cos(angle * Math.PI / 180) * radius,
                    lng: baseCoords.lng + Math.sin(angle * Math.PI / 180) * radius
                }
            };
        });
    }, [filteredDonors]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleContactDonor = async (donor: any, contactType: string) => {
        try {
            setContacting(true);
            await contactAPI.contactDonor(donor.id, contactType, `Contact request from Jiwandan user`);
            setSelectedDonor(null);

            const messages: Record<string, { title: string; description: string }> = {
                call: { title: "Call Request Sent", description: `Call request sent to ${donor.username || donor.name}.` },
                message: { title: "Message Sent", description: `Your message has been sent to ${donor.username || donor.name}.` },
                request: { title: "Blood Request Sent", description: `Emergency blood request sent to ${donor.username || donor.name}.` },
                email: { title: "Email Sent", description: `Email sent to ${donor.username || donor.name}.` }
            };

            toast({
                title: messages[contactType]?.title || "Request Sent",
                description: messages[contactType]?.description || "Your request has been sent successfully.",
            });
        } catch (error) {
            toast({
                title: "Contact Failed",
                description: "Failed to send contact request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setContacting(false);
        }
    };

    const getMarkerIcon = (bloodType: string, isSelected: boolean) => {
        const color = bloodTypeColors[bloodType] || '#6b7280';
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 14 : 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: isSelected ? '#3b82f6' : '#ffffff',
            strokeWeight: isSelected ? 3 : 2,
        };
    };

    if (loadError) {
        return (
            <div className="w-full h-[450px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load Google Maps</p>
                    <p className="text-sm text-gray-500 mt-2">Please check your API key configuration</p>
                </div>
            </div>
        );
    }

    if (!isLoaded || loading) {
        return (
            <div className="w-full h-[450px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    <span className="text-gray-600">{loading ? 'Loading donors...' : 'Loading map...'}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[450px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                    <Button onClick={refetch} size="sm" className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-lg overflow-hidden shadow-lg">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={nepalCenter}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: [
                        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
                    ]
                }}
            >
                {/* Nepal Center Marker (Kathmandu) */}
                <Marker
                    position={nepalCenter}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                    }}
                    title="Kathmandu, Nepal"
                    zIndex={1000}
                />

                {/* Donor Markers */}
                {donorsWithPositions.map((donor) => (
                    <Marker
                        key={donor.id}
                        position={donor.position}
                        onClick={() => {
                            setSelectedDonor(donor);
                            if (map) {
                                map.panTo(donor.position);
                            }
                        }}
                        icon={getMarkerIcon(donor.bloodType, selectedDonor?.id === donor.id)}
                        title={`${donor.username || donor.name} - ${donor.bloodType}`}
                        label={{
                            text: donor.bloodType || 'O+',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}
                    />
                ))}

                {/* Info Window for Selected Donor */}
                {selectedDonor && (
                    <InfoWindow
                        position={selectedDonor.position}
                        onCloseClick={() => setSelectedDonor(null)}
                        options={{ maxWidth: 300 }}
                    >
                        <div className="p-2 min-w-[260px]">
                            {/* Header */}
                            <div className="flex items-center space-x-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    style={{ backgroundColor: bloodTypeColors[selectedDonor.bloodType] || '#6b7280' }}
                                >
                                    {selectedDonor.bloodType || 'O+'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedDonor.username || selectedDonor.name || 'Anonymous Hero'}</h3>
                                    <Badge variant={(selectedDonor.status || 'available') === 'available' ? 'default' : 'secondary'} className="text-xs">
                                        {(selectedDonor.status || 'available') === 'available' ? 'Available Now' : 'Currently Busy'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>{selectedDonor.distance || 'Near you'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Last donation: {selectedDonor.lastDonation || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Heart className="h-4 w-4 mr-2" />
                                    <span>{selectedDonor.donations || 0} total donations</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    onClick={() => handleContactDonor(selectedDonor, 'request')}
                                    disabled={selectedDonor.status === 'busy' || contacting}
                                    size="sm"
                                >
                                    {contacting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                                    Send Blood Request
                                </Button>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleContactDonor(selectedDonor, 'call')} disabled={contacting}>
                                        <Phone className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleContactDonor(selectedDonor, 'message')} disabled={contacting}>
                                        <MessageCircle className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleContactDonor(selectedDonor, 'email')} disabled={contacting}>
                                        <Mail className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-10">
                <div className="text-xs font-semibold text-gray-700 mb-2">Blood Types</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(bloodTypeColors).map(([type, color]) => (
                        <div key={type} className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                            <span>{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Counter */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border z-10">
                <div className="text-sm font-medium text-gray-700">
                    {filteredDonors.length} donors found
                </div>
            </div>

            {/* Map Center Label */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border z-10">
                <div className="flex items-center text-sm text-gray-700">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Kathmandu Valley</span>
                </div>
            </div>
        </div>
    );
}
