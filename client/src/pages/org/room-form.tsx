/**
 * Room Availability Form
 * Form for hospitals to update ICU/ER/General room availability
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
    Bed, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
    Plus, Minus, Clock, Wind, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganizationAuth } from '@/hooks/use-organization-auth';
import { supabase } from '@/lib/supabase';

const ROOM_TYPES = [
    { key: 'icu', label: 'ICU', icon: Activity, color: 'red' },
    { key: 'emergency', label: 'Emergency', icon: Wind, color: 'orange' },
    { key: 'general', label: 'General', icon: Bed, color: 'blue' },
    { key: 'nicu', label: 'NICU', icon: Bed, color: 'pink' },
    { key: 'ccu', label: 'CCU', icon: Activity, color: 'purple' },
    { key: 'isolation', label: 'Isolation', icon: Bed, color: 'yellow' },
] as const;

interface RoomData {
    total: number;
    occupied: number;
    ventilators: number;
    ventilatorsInUse: number;
}

interface RoomAvailability {
    [key: string]: RoomData;
}

export function RoomFormPage() {
    const [, navigate] = useLocation();
    const { organization, isLoading: authLoading } = useOrganizationAuth();

    const [rooms, setRooms] = useState<RoomAvailability>(() =>
        ROOM_TYPES.reduce((acc, type) => ({
            ...acc,
            [type.key]: { total: 0, occupied: 0, ventilators: 0, ventilatorsInUse: 0 }
        }), {})
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Redirect if not logged in or not a hospital
    useEffect(() => {
        if (!authLoading && !organization) {
            navigate('/org/login');
        } else if (organization && organization.organizationType !== 'hospital') {
            navigate('/org/dashboard');
        }
    }, [organization, authLoading, navigate]);

    // Fetch current room data
    useEffect(() => {
        const fetchRooms = async () => {
            if (!organization || !supabase) return;
            setIsLoading(true);

            try {
                const { data } = await supabase
                    .from('hospital_room_availability')
                    .select('*')
                    .eq('hospital_id', organization.hospitalId);

                if (data) {
                    const roomData: RoomAvailability = {};
                    data.forEach((item: any) => {
                        roomData[item.room_type] = {
                            total: item.total_beds,
                            occupied: item.occupied_beds,
                            ventilators: item.ventilators_total || 0,
                            ventilatorsInUse: item.ventilators_in_use || 0,
                        };
                    });

                    // Fill in missing types
                    ROOM_TYPES.forEach(type => {
                        if (!roomData[type.key]) {
                            roomData[type.key] = { total: 0, occupied: 0, ventilators: 0, ventilatorsInUse: 0 };
                        }
                    });

                    setRooms(roomData);
                }
            } catch (err) {
                console.error('Error fetching rooms:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [organization]);

    const updateRoom = (type: string, field: keyof RoomData, value: number) => {
        setRooms(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: Math.max(0, value),
            }
        }));
    };

    const handleSubmit = async () => {
        if (!organization) return;
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            if (!supabase) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSuccess(true);
                setLastUpdated(new Date().toLocaleString());
                return;
            }

            // Upsert room data
            for (const type of ROOM_TYPES) {
                const roomData = rooms[type.key];
                if (roomData.total > 0 || roomData.occupied > 0) {
                    await supabase.from('hospital_room_availability').upsert({
                        hospital_id: organization.hospitalId,
                        room_type: type.key,
                        total_beds: roomData.total,
                        occupied_beds: Math.min(roomData.occupied, roomData.total),
                        ventilators_total: roomData.ventilators,
                        ventilators_in_use: Math.min(roomData.ventilatorsInUse, roomData.ventilators),
                    }, { onConflict: 'hospital_id,room_type' });
                }
            }

            // Log submission
            await supabase.from('data_submission_logs').insert({
                organization_account_id: organization.id,
                organization_type: organization.organizationType,
                data_type: 'room_availability',
                summary: {
                    rooms_updated: ROOM_TYPES.length,
                    total_beds: Object.values(rooms).reduce((sum, r) => sum + r.total, 0),
                    available_beds: Object.values(rooms).reduce((sum, r) => sum + (r.total - r.occupied), 0),
                }
            });

            setSuccess(true);
            setLastUpdated(new Date().toLocaleString());
        } catch (err: any) {
            setError(err.message || 'Failed to save room data');
        } finally {
            setIsSaving(false);
        }
    };

    const totalBeds = Object.values(rooms).reduce((sum, r) => sum + r.total, 0);
    const occupiedBeds = Object.values(rooms).reduce((sum, r) => sum + r.occupied, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    if (!organization || organization.organizationType !== 'hospital') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/org/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Bed className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Room Availability</h1>
                                <p className="text-sm text-gray-500">{organization.organizationName}</p>
                            </div>
                        </div>
                    </div>

                    {lastUpdated && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last updated: {lastUpdated}
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{totalBeds}</p>
                        <p className="text-sm text-gray-500">Total Beds</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{availableBeds}</p>
                        <p className="text-sm text-gray-500">Available</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-orange-600">{occupiedBeds}</p>
                        <p className="text-sm text-gray-500">Occupied</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className={`text-3xl font-bold ${occupancyRate > 90 ? 'text-red-600' :
                                occupancyRate > 70 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {occupancyRate}%
                        </p>
                        <p className="text-sm text-gray-500">Occupancy</p>
                    </Card>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        Room availability updated successfully!
                    </div>
                )}

                {/* Room Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {ROOM_TYPES.map(type => {
                        const TypeIcon = type.icon;
                        const room = rooms[type.key];
                        const available = room.total - room.occupied;

                        return (
                            <Card key={type.key} className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                                        <TypeIcon className={`w-5 h-5 text-${type.color}-600`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{type.label}</h3>
                                        <p className="text-sm text-gray-500">
                                            {available} / {room.total} available
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Total Beds</Label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateRoom(type.key, 'total', room.total - 1)}
                                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <Input
                                                type="number"
                                                value={room.total}
                                                onChange={(e) => updateRoom(type.key, 'total', parseInt(e.target.value) || 0)}
                                                className="text-center"
                                                min={0}
                                            />
                                            <button
                                                onClick={() => updateRoom(type.key, 'total', room.total + 1)}
                                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Occupied</Label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateRoom(type.key, 'occupied', room.occupied - 1)}
                                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <Input
                                                type="number"
                                                value={room.occupied}
                                                onChange={(e) => updateRoom(type.key, 'occupied', parseInt(e.target.value) || 0)}
                                                className="text-center"
                                                min={0}
                                                max={room.total}
                                            />
                                            <button
                                                onClick={() => updateRoom(type.key, 'occupied', room.occupied + 1)}
                                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Ventilators for ICU/CCU */}
                                {(type.key === 'icu' || type.key === 'ccu') && (
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                        <div>
                                            <Label className="flex items-center gap-1">
                                                <Wind className="w-4 h-4" /> Ventilators
                                            </Label>
                                            <Input
                                                type="number"
                                                value={room.ventilators}
                                                onChange={(e) => updateRoom(type.key, 'ventilators', parseInt(e.target.value) || 0)}
                                                className="text-center"
                                                min={0}
                                            />
                                        </div>
                                        <div>
                                            <Label>In Use</Label>
                                            <Input
                                                type="number"
                                                value={room.ventilatorsInUse}
                                                onChange={(e) => updateRoom(type.key, 'ventilatorsInUse', parseInt(e.target.value) || 0)}
                                                className="text-center"
                                                min={0}
                                                max={room.ventilators}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Occupancy bar */}
                                <div className="mt-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${room.total === 0 ? 'bg-gray-300' :
                                                    (room.occupied / room.total) > 0.9 ? 'bg-red-500' :
                                                        (room.occupied / room.total) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${room.total > 0 ? (room.occupied / room.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Room Availability</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default RoomFormPage;
