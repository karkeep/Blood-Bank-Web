import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import {
    Hospital, MapPin, Phone, Clock, Navigation, Star, AlertCircle,
    Heart, Activity, Wind, Bed, ChevronRight, RefreshCw, Filter,
    Search, Loader2, CheckCircle, XCircle, AlertTriangle, Info, Map, List
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealGoogleHospitalMap } from '@/components/maps/google-hospital-map';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
    image_url?: string;
}

// Sample data for when Supabase is not available
const sampleHospitals: Hospital[] = [
    {
        id: '1', name: 'Bir Hospital', address: 'Mahaboudha, Kathmandu', city: 'Kathmandu',
        phone: '01-4221119', emergency_phone: '01-4221988', distance_km: 2.5,
        emergency_beds_available: 12, icu_beds_available: 8, ventilators_available: 6, beds_available: 85,
        emergency_status: 'normal', current_wait_time_mins: 15, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.2, latitude: 27.7033, longitude: 85.3167
    },
    {
        id: '2', name: 'Teaching Hospital (TUTH)', address: 'Maharajgunj, Kathmandu', city: 'Kathmandu',
        phone: '01-4412303', emergency_phone: '01-4412505', distance_km: 4.8,
        emergency_beds_available: 18, icu_beds_available: 15, ventilators_available: 12, beds_available: 120,
        emergency_status: 'busy', current_wait_time_mins: 25, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.5, latitude: 27.7372, longitude: 85.3308
    },
    {
        id: '3', name: 'Grande International Hospital', address: 'Dhapasi, Kathmandu', city: 'Kathmandu',
        phone: '01-5159266', emergency_phone: '01-5159277', distance_km: 5.2,
        emergency_beds_available: 10, icu_beds_available: 12, ventilators_available: 10, beds_available: 45,
        emergency_status: 'normal', current_wait_time_mins: 10, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.7, latitude: 27.7419, longitude: 85.3506
    },
    {
        id: '4', name: 'Patan Hospital', address: 'Lagankhel, Lalitpur', city: 'Lalitpur',
        phone: '01-5522295', emergency_phone: '01-5522266', distance_km: 3.1,
        emergency_beds_available: 8, icu_beds_available: 5, ventilators_available: 4, beds_available: 65,
        emergency_status: 'normal', current_wait_time_mins: 20, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.4, latitude: 27.6683, longitude: 85.3264
    },
    {
        id: '5', name: 'National Trauma Center', address: 'Mahankal, Kathmandu', city: 'Kathmandu',
        phone: '01-4499000', emergency_phone: '01-4499111', distance_km: 3.5,
        emergency_beds_available: 15, icu_beds_available: 12, ventilators_available: 10, beds_available: 35,
        emergency_status: 'normal', current_wait_time_mins: 8, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.5, latitude: 27.7122, longitude: 85.3136
    },
    {
        id: '6', name: 'Norvic International Hospital', address: 'Thapathali, Kathmandu', city: 'Kathmandu',
        phone: '01-4258554', emergency_phone: '01-4258555', distance_km: 2.8,
        emergency_beds_available: 7, icu_beds_available: 10, ventilators_available: 8, beds_available: 40,
        emergency_status: 'busy', current_wait_time_mins: 30, accepts_emergencies: true,
        is_24_hours: true, average_rating: 4.6, latitude: 27.6947, longitude: 85.3197
    }
];

export default function EmergencyRoomsPage() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'emergency' | 'icu' | 'ventilator'>('all');
    const [radiusKm, setRadiusKm] = useState(25);
    const { toast } = useToast();

    // Get user's location
    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationError(null);
                },
                (error) => {
                    console.log('Location error:', error);
                    // Default to Kathmandu
                    setUserLocation({ lat: 27.7172, lng: 85.3240 });
                    setLocationError('Using default location (Kathmandu). Enable location for accurate results.');
                }
            );
        } else {
            setUserLocation({ lat: 27.7172, lng: 85.3240 });
            setLocationError('Geolocation not supported. Using default location.');
        }
    }, []);

    // Fetch hospitals
    const fetchHospitals = useCallback(async () => {
        if (!userLocation) return;

        setLoading(true);
        try {
            if (isSupabaseEnabled && supabase) {
                // Try to use the database function
                const { data, error } = await supabase.rpc('find_nearby_hospitals', {
                    p_latitude: userLocation.lat,
                    p_longitude: userLocation.lng,
                    p_radius_km: radiusKm,
                    p_type: activeFilter,
                    p_limit: 20
                });

                if (error) {
                    console.log('RPC error, falling back to direct query:', error);
                    // Fallback to direct query
                    const { data: directData, error: directError } = await supabase
                        .from('hospitals')
                        .select('*')
                        .eq('is_active', true)
                        .limit(20);

                    if (!directError && directData) {
                        const hospitalsWithDistance = directData.map(h => ({
                            ...h,
                            distance_km: calculateDistance(userLocation.lat, userLocation.lng, h.latitude, h.longitude)
                        })).sort((a, b) => a.distance_km - b.distance_km);
                        setHospitals(hospitalsWithDistance as Hospital[]);
                    } else {
                        setHospitals(sampleHospitals);
                    }
                } else if (data) {
                    setHospitals(data as Hospital[]);
                }
            } else {
                // Use sample data with calculated distances
                const hospitalsWithDistance = sampleHospitals.map(h => ({
                    ...h,
                    distance_km: calculateDistance(userLocation.lat, userLocation.lng, h.latitude, h.longitude)
                })).sort((a, b) => a.distance_km - b.distance_km);
                setHospitals(hospitalsWithDistance);
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            setHospitals(sampleHospitals);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userLocation, radiusKm, activeFilter]);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    };

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    useEffect(() => {
        if (userLocation) {
            fetchHospitals();
        }
    }, [userLocation, fetchHospitals]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHospitals();
        toast({
            title: "Refreshing",
            description: "Getting latest hospital availability..."
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return 'bg-green-100 text-green-800 border-green-200';
            case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'full': return 'bg-red-100 text-red-800 border-red-200';
            case 'not_accepting': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'normal': return <CheckCircle className="h-4 w-4" />;
            case 'busy': return <Clock className="h-4 w-4" />;
            case 'critical': return <AlertTriangle className="h-4 w-4" />;
            case 'full': return <XCircle className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    const filteredHospitals = hospitals.filter(h => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return h.name.toLowerCase().includes(query) ||
                h.city.toLowerCase().includes(query) ||
                h.address.toLowerCase().includes(query);
        }
        return true;
    });

    const openDirections = (hospital: Hospital) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
        window.open(url, '_blank');
    };

    const callHospital = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Hospital className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Emergency Rooms Near You</h1>
                            <p className="text-blue-100 mt-1">Real-time availability of ER, ICU, and ventilators</p>
                        </div>
                    </div>

                    {locationError && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-yellow-200" />
                            <span className="text-sm text-yellow-100">{locationError}</span>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-2">
                                <Bed className="h-6 w-6 text-green-300" />
                                <span className="text-2xl font-bold">
                                    {hospitals.reduce((sum, h) => sum + (h.emergency_beds_available || 0), 0)}
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">ER Beds Available</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-6 w-6 text-red-300" />
                                <span className="text-2xl font-bold">
                                    {hospitals.reduce((sum, h) => sum + (h.icu_beds_available || 0), 0)}
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">ICU Beds Available</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-2">
                                <Wind className="h-6 w-6 text-cyan-300" />
                                <span className="text-2xl font-bold">
                                    {hospitals.reduce((sum, h) => sum + (h.ventilators_available || 0), 0)}
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">Ventilators Available</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-2">
                                <Hospital className="h-6 w-6 text-purple-300" />
                                <span className="text-2xl font-bold">{hospitals.length}</span>
                            </div>
                            <p className="text-blue-100 text-sm mt-1">Hospitals Nearby</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="container mx-auto px-4 -mt-6">
                <Card className="shadow-xl border-0">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search hospitals by name or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)} className="w-full md:w-auto">
                                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                                    <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
                                    <TabsTrigger value="emergency" className="text-xs md:text-sm">ER</TabsTrigger>
                                    <TabsTrigger value="icu" className="text-xs md:text-sm">ICU</TabsTrigger>
                                    <TabsTrigger value="ventilator" className="text-xs md:text-sm">Ventilator</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map and Hospital List with Tabs */}
            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="map" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="map" className="flex items-center">
                                <Map className="h-4 w-4 mr-2" />
                                Map View
                            </TabsTrigger>
                            <TabsTrigger value="list" className="flex items-center">
                                <List className="h-4 w-4 mr-2" />
                                List View
                            </TabsTrigger>
                        </TabsList>
                        <div className="text-sm text-gray-500">
                            {filteredHospitals.length} hospitals found
                        </div>
                    </div>

                    <TabsContent value="map" className="min-h-[500px]">
                        <ErrorBoundary fallback={
                            <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
                                <div className="text-center p-6">
                                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
                                    <p className="text-gray-500 mb-4">
                                        There was a problem loading the map.
                                    </p>
                                    <Button onClick={() => window.location.reload()} variant="outline">
                                        Refresh Page
                                    </Button>
                                </div>
                            </div>
                        }>
                            <RealGoogleHospitalMap filter={activeFilter} />
                        </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="list">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                                <p className="text-gray-600">Finding hospitals near you...</p>
                            </div>
                        ) : filteredHospitals.length === 0 ? (
                            <div className="text-center py-20">
                                <Hospital className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600">No hospitals found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredHospitals.map((hospital, index) => (
                                    <Card
                                        key={hospital.id}
                                        className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${hospital.emergency_status === 'normal' ? 'border-l-green-500' :
                                            hospital.emergency_status === 'busy' ? 'border-l-yellow-500' :
                                                hospital.emergency_status === 'critical' ? 'border-l-orange-500' :
                                                    'border-l-red-500'
                                            }`}
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Hospital Info */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                                                                }`}>
                                                                <Hospital className={`h-6 w-6 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h3 className="text-lg font-bold text-gray-900">{hospital.name}</h3>
                                                                    {index === 0 && (
                                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Nearest</Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                                                    <MapPin className="h-4 w-4 mr-1" />
                                                                    {hospital.address}, {hospital.city}
                                                                </div>
                                                                <div className="flex items-center space-x-4 mt-2">
                                                                    <Badge variant="outline" className={getStatusColor(hospital.emergency_status)}>
                                                                        {getStatusIcon(hospital.emergency_status)}
                                                                        <span className="ml-1 capitalize">{hospital.emergency_status}</span>
                                                                    </Badge>
                                                                    {hospital.is_24_hours && (
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            <Clock className="h-3 w-3 mr-1" />
                                                                            24/7
                                                                        </Badge>
                                                                    )}
                                                                    <div className="flex items-center text-yellow-600">
                                                                        <Star className="h-4 w-4 fill-current" />
                                                                        <span className="ml-1 text-sm font-medium">{hospital.average_rating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-blue-600">{hospital.distance_km} km</div>
                                                            <div className="text-sm text-gray-500">
                                                                ~{Math.round(hospital.current_wait_time_mins)} min wait
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Availability Stats */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hospital.emergency_beds_available > 5 ? 'bg-green-100' :
                                                                hospital.emergency_beds_available > 0 ? 'bg-yellow-100' : 'bg-red-100'
                                                                }`}>
                                                                <Bed className={`h-5 w-5 ${hospital.emergency_beds_available > 5 ? 'text-green-600' :
                                                                    hospital.emergency_beds_available > 0 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-bold text-gray-900">{hospital.emergency_beds_available}</div>
                                                                <div className="text-xs text-gray-500">ER Beds</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hospital.icu_beds_available > 3 ? 'bg-green-100' :
                                                                hospital.icu_beds_available > 0 ? 'bg-yellow-100' : 'bg-red-100'
                                                                }`}>
                                                                <Activity className={`h-5 w-5 ${hospital.icu_beds_available > 3 ? 'text-green-600' :
                                                                    hospital.icu_beds_available > 0 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-bold text-gray-900">{hospital.icu_beds_available}</div>
                                                                <div className="text-xs text-gray-500">ICU Beds</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hospital.ventilators_available > 3 ? 'bg-green-100' :
                                                                hospital.ventilators_available > 0 ? 'bg-yellow-100' : 'bg-red-100'
                                                                }`}>
                                                                <Wind className={`h-5 w-5 ${hospital.ventilators_available > 3 ? 'text-green-600' :
                                                                    hospital.ventilators_available > 0 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-bold text-gray-900">{hospital.ventilators_available}</div>
                                                                <div className="text-xs text-gray-500">Ventilators</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                                                                <Heart className="h-5 w-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-bold text-gray-900">{hospital.beds_available}</div>
                                                                <div className="text-xs text-gray-500">General Beds</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="lg:w-48 bg-gray-50 p-4 flex flex-row lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-gray-100">
                                                    <Button
                                                        className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                                                        onClick={() => callHospital(hospital.emergency_phone || hospital.phone)}
                                                    >
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call ER
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 lg:flex-none"
                                                        onClick={() => openDirections(hospital)}
                                                    >
                                                        <Navigation className="h-4 w-4 mr-2" />
                                                        Directions
                                                    </Button>
                                                    <Button variant="ghost" className="flex-1 lg:flex-none text-blue-600">
                                                        Details
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Emergency Contact Banner */}
                <Card className="mt-8 bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Medical Emergency?</h3>
                                    <p className="text-red-100">Call emergency services immediately</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <Button
                                    size="lg"
                                    className="bg-white text-red-600 hover:bg-red-50"
                                    onClick={() => callHospital('102')}
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    Call 102
                                </Button>
                                <Link href="/emergency-request">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                        Request Blood
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}

