import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
    Hospital as HospitalIcon, Phone, Navigation, Bed, Activity, Wind,
    Clock, Star, Loader2, AlertCircle, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';

interface Hospital {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    emergency_phone: string;
    distance_km: number;
    emergency_beds_available: number;
    icu_beds_available: number;
    ventilators_available: number;
    beds_available: number;
    emergency_status: 'normal' | 'busy' | 'critical' | 'full' | 'not_accepting';
    current_wait_time_mins: number;
    accepts_emergencies: boolean;
    is_24_hours: boolean;
    average_rating: number;
    latitude: number;
    longitude: number;
}

// Sample hospitals
const sampleHospitals: Hospital[] = [
    { id: '1', name: 'Bir Hospital', address: 'Mahaboudha, Kathmandu', city: 'Kathmandu', phone: '01-4221119', emergency_phone: '01-4221988', distance_km: 2.5, emergency_beds_available: 12, icu_beds_available: 8, ventilators_available: 6, beds_available: 85, emergency_status: 'normal', current_wait_time_mins: 15, accepts_emergencies: true, is_24_hours: true, average_rating: 4.2, latitude: 27.7033, longitude: 85.3167 },
    { id: '2', name: 'Teaching Hospital (TUTH)', address: 'Maharajgunj, Kathmandu', city: 'Kathmandu', phone: '01-4412303', emergency_phone: '01-4412505', distance_km: 4.8, emergency_beds_available: 18, icu_beds_available: 15, ventilators_available: 12, beds_available: 120, emergency_status: 'busy', current_wait_time_mins: 25, accepts_emergencies: true, is_24_hours: true, average_rating: 4.5, latitude: 27.7372, longitude: 85.3308 },
    { id: '3', name: 'Grande International Hospital', address: 'Dhapasi, Kathmandu', city: 'Kathmandu', phone: '01-5159266', emergency_phone: '01-5159277', distance_km: 5.2, emergency_beds_available: 10, icu_beds_available: 12, ventilators_available: 10, beds_available: 45, emergency_status: 'normal', current_wait_time_mins: 10, accepts_emergencies: true, is_24_hours: true, average_rating: 4.7, latitude: 27.7419, longitude: 85.3506 },
    { id: '4', name: 'Patan Hospital', address: 'Lagankhel, Lalitpur', city: 'Lalitpur', phone: '01-5522295', emergency_phone: '01-5522266', distance_km: 3.1, emergency_beds_available: 8, icu_beds_available: 5, ventilators_available: 4, beds_available: 65, emergency_status: 'normal', current_wait_time_mins: 20, accepts_emergencies: true, is_24_hours: true, average_rating: 4.4, latitude: 27.6683, longitude: 85.3264 },
    { id: '5', name: 'National Trauma Center', address: 'Mahankal, Kathmandu', city: 'Kathmandu', phone: '01-4499000', emergency_phone: '01-4499111', distance_km: 3.5, emergency_beds_available: 15, icu_beds_available: 12, ventilators_available: 10, beds_available: 35, emergency_status: 'normal', current_wait_time_mins: 8, accepts_emergencies: true, is_24_hours: true, average_rating: 4.5, latitude: 27.7122, longitude: 85.3136 },
    { id: '6', name: 'Norvic International Hospital', address: 'Thapathali, Kathmandu', city: 'Kathmandu', phone: '01-4258554', emergency_phone: '01-4258555', distance_km: 2.8, emergency_beds_available: 7, icu_beds_available: 10, ventilators_available: 8, beds_available: 40, emergency_status: 'busy', current_wait_time_mins: 30, accepts_emergencies: true, is_24_hours: true, average_rating: 4.6, latitude: 27.6947, longitude: 85.3197 },
    { id: '7', name: 'B&B Hospital', address: 'Gwarko, Lalitpur', city: 'Lalitpur', phone: '01-5533206', emergency_phone: '01-5533200', distance_km: 4.2, emergency_beds_available: 5, icu_beds_available: 8, ventilators_available: 6, beds_available: 50, emergency_status: 'critical', current_wait_time_mins: 45, accepts_emergencies: true, is_24_hours: true, average_rating: 4.4, latitude: 27.6678, longitude: 85.3383 },
    { id: '8', name: 'Nepal Medical College', address: 'Jorpati, Kathmandu', city: 'Kathmandu', phone: '01-4911008', emergency_phone: '01-4911000', distance_km: 6.1, emergency_beds_available: 6, icu_beds_available: 6, ventilators_available: 4, beds_available: 55, emergency_status: 'normal', current_wait_time_mins: 15, accepts_emergencies: true, is_24_hours: true, average_rating: 4.3, latitude: 27.7356, longitude: 85.3856 },
];

const mapContainerStyle = {
    width: '100%',
    height: '500px'
};

const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240
};

// Custom marker icons based on status
const getMarkerIcon = (status: string, isSelected: boolean) => {
    const color = status === 'normal' ? '#22c55e' :
        status === 'busy' ? '#eab308' :
            status === 'critical' ? '#f97316' : '#ef4444';

    return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: isSelected ? '#3b82f6' : '#ffffff',
        strokeWeight: isSelected ? 3 : 2,
        scale: isSelected ? 2 : 1.5,
        anchor: { x: 12, y: 24 } as google.maps.Point,
    };
};

interface RealGoogleHospitalMapProps {
    filter?: 'all' | 'emergency' | 'icu' | 'ventilator';
    onHospitalSelect?: (hospital: Hospital | null) => void;
}

export function RealGoogleHospitalMap({ filter = 'all', onHospitalSelect }: RealGoogleHospitalMapProps) {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(defaultCenter);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Load Google Maps API
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        id: 'google-map-script'
    });

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setUserLocation(defaultCenter)
            );
        }
    }, []);

    // Fetch hospitals
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                if (isSupabaseEnabled && supabase) {
                    const { data, error } = await supabase
                        .from('hospitals')
                        .select('*')
                        .eq('is_active', true)
                        .limit(20);

                    if (!error && data && data.length > 0) {
                        setHospitals(data as Hospital[]);
                    } else {
                        setHospitals(sampleHospitals);
                    }
                } else {
                    setHospitals(sampleHospitals);
                }
            } catch (error) {
                setHospitals(sampleHospitals);
            }
        };
        fetchHospitals();
    }, []);

    // Filter hospitals
    const filteredHospitals = useMemo(() => {
        return hospitals.filter(h => {
            if (filter === 'all') return true;
            if (filter === 'emergency') return h.emergency_beds_available > 0;
            if (filter === 'icu') return h.icu_beds_available > 0;
            if (filter === 'ventilator') return h.ventilators_available > 0;
            return true;
        });
    }, [hospitals, filter]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMarkerClick = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        onHospitalSelect?.(hospital);
        if (map) {
            map.panTo({ lat: hospital.latitude, lng: hospital.longitude });
        }
    };

    const openDirections = (hospital: Hospital) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`, '_blank');
    };

    const callHospital = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const getStatusBadge = (status: string) => {
        const configs = {
            normal: { icon: <CheckCircle className="h-3 w-3" />, text: 'Available', class: 'bg-green-100 text-green-700 border-green-200' },
            busy: { icon: <Clock className="h-3 w-3" />, text: 'Busy', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            critical: { icon: <AlertTriangle className="h-3 w-3" />, text: 'Critical', class: 'bg-orange-100 text-orange-700 border-orange-200' },
            full: { icon: <XCircle className="h-3 w-3" />, text: 'Full', class: 'bg-red-100 text-red-700 border-red-200' },
        };
        const config = configs[status as keyof typeof configs] || configs.full;
        return (
            <Badge variant="outline" className={`text-xs ${config.class}`}>
                {config.icon}
                <span className="ml-1">{config.text}</span>
            </Badge>
        );
    };

    if (loadError) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load Google Maps</p>
                    <p className="text-sm text-gray-500 mt-2">Please check your API key configuration</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading map...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-lg overflow-hidden shadow-lg">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: [
                        { featureType: 'poi.medical', elementType: 'labels', stylers: [{ visibility: 'on' }] },
                        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
                    ]
                }}
            >
                {/* User Location Marker */}
                <Marker
                    position={userLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                    }}
                    title="Your Location"
                />

                {/* Hospital Markers */}
                {filteredHospitals.map((hospital) => (
                    <Marker
                        key={hospital.id}
                        position={{ lat: hospital.latitude, lng: hospital.longitude }}
                        onClick={() => handleMarkerClick(hospital)}
                        icon={getMarkerIcon(hospital.emergency_status, selectedHospital?.id === hospital.id)}
                        title={hospital.name}
                    />
                ))}

                {/* Info Window for Selected Hospital */}
                {selectedHospital && (
                    <InfoWindow
                        position={{ lat: selectedHospital.latitude, lng: selectedHospital.longitude }}
                        onCloseClick={() => {
                            setSelectedHospital(null);
                            onHospitalSelect?.(null);
                        }}
                        options={{ maxWidth: 320 }}
                    >
                        <div className="p-2 min-w-[280px]">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{selectedHospital.name}</h3>
                                    <p className="text-gray-500 text-sm">{selectedHospital.address}</p>
                                </div>
                                {getStatusBadge(selectedHospital.emergency_status)}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                <div className={`text-center p-2 rounded ${selectedHospital.emergency_beds_available > 5 ? 'bg-green-50' : selectedHospital.emergency_beds_available > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                    <Bed className={`h-4 w-4 mx-auto ${selectedHospital.emergency_beds_available > 5 ? 'text-green-600' : selectedHospital.emergency_beds_available > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                                    <div className="text-lg font-bold">{selectedHospital.emergency_beds_available}</div>
                                    <div className="text-[10px] text-gray-500">ER</div>
                                </div>
                                <div className={`text-center p-2 rounded ${selectedHospital.icu_beds_available > 3 ? 'bg-green-50' : selectedHospital.icu_beds_available > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                    <Activity className={`h-4 w-4 mx-auto ${selectedHospital.icu_beds_available > 3 ? 'text-green-600' : selectedHospital.icu_beds_available > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                                    <div className="text-lg font-bold">{selectedHospital.icu_beds_available}</div>
                                    <div className="text-[10px] text-gray-500">ICU</div>
                                </div>
                                <div className={`text-center p-2 rounded ${selectedHospital.ventilators_available > 3 ? 'bg-green-50' : selectedHospital.ventilators_available > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                    <Wind className={`h-4 w-4 mx-auto ${selectedHospital.ventilators_available > 3 ? 'text-green-600' : selectedHospital.ventilators_available > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                                    <div className="text-lg font-bold">{selectedHospital.ventilators_available}</div>
                                    <div className="text-[10px] text-gray-500">Vent</div>
                                </div>
                                <div className="text-center p-2 rounded bg-blue-50">
                                    <Clock className="h-4 w-4 mx-auto text-blue-600" />
                                    <div className="text-lg font-bold">{selectedHospital.current_wait_time_mins}</div>
                                    <div className="text-[10px] text-gray-500">Min</div>
                                </div>
                            </div>

                            {/* Rating & 24/7 */}
                            <div className="flex items-center justify-between mb-3 text-sm">
                                <div className="flex items-center text-yellow-600">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="ml-1 font-medium">{selectedHospital.average_rating}</span>
                                </div>
                                {selectedHospital.is_24_hours && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        24/7
                                    </Badge>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => callHospital(selectedHospital.emergency_phone || selectedHospital.phone)}
                                >
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call ER
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => openDirections(selectedHospital)}
                                >
                                    <Navigation className="h-4 w-4 mr-1" />
                                    Directions
                                </Button>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-10">
                <div className="text-xs font-semibold text-gray-700 mb-2">Hospital Status</div>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Busy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Critical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Full</span>
                    </div>
                </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-10">
                <div className="flex gap-4 text-xs">
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                            {filteredHospitals.reduce((sum, h) => sum + h.emergency_beds_available, 0)}
                        </div>
                        <div className="text-gray-500">ER Beds</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                            {filteredHospitals.reduce((sum, h) => sum + h.icu_beds_available, 0)}
                        </div>
                        <div className="text-gray-500">ICU Beds</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-cyan-600">
                            {filteredHospitals.reduce((sum, h) => sum + h.ventilators_available, 0)}
                        </div>
                        <div className="text-gray-500">Ventilators</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
