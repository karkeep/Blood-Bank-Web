/**
 * Blood Inventory Form
 * Easy form for organizations to update blood inventory
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
    Droplets, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
    Plus, Minus, Clock, TrendingUp, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganizationAuth } from '@/hooks/use-organization-auth';
import { supabase } from '@/lib/supabase';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface BloodInventory {
    [key: string]: {
        available: number;
        capacity: number;
        expiringSoon: number;
    };
}

export function InventoryFormPage() {
    const [, navigate] = useLocation();
    const { organization, isLoading: authLoading } = useOrganizationAuth();

    const [inventory, setInventory] = useState<BloodInventory>(() =>
        BLOOD_TYPES.reduce((acc, type) => ({
            ...acc,
            [type]: { available: 0, capacity: 50, expiringSoon: 0 }
        }), {})
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !organization) {
            navigate('/org/login');
        }
    }, [organization, authLoading, navigate]);

    // Fetch current inventory
    useEffect(() => {
        const fetchInventory = async () => {
            if (!organization || !supabase) return;
            setIsLoading(true);

            try {
                const orgId = organization.bloodBankId || organization.hospitalId;
                if (!orgId) return;

                const { data } = await supabase
                    .from('blood_inventory')
                    .select('*')
                    .eq('blood_bank_id', orgId);

                if (data) {
                    const inv: BloodInventory = {};
                    data.forEach((item: any) => {
                        inv[item.blood_type] = {
                            available: item.units_available,
                            capacity: item.total_capacity,
                            expiringSoon: item.expiring_soon || 0,
                        };
                    });

                    // Fill in missing types
                    BLOOD_TYPES.forEach(type => {
                        if (!inv[type]) {
                            inv[type] = { available: 0, capacity: 50, expiringSoon: 0 };
                        }
                    });

                    setInventory(inv);
                }
            } catch (err) {
                console.error('Error fetching inventory:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventory();
    }, [organization]);

    const updateBloodType = (type: string, field: 'available' | 'capacity' | 'expiringSoon', value: number) => {
        setInventory(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: Math.max(0, value),
            }
        }));
    };

    const incrementBlood = (type: string) => {
        updateBloodType(type, 'available', inventory[type].available + 1);
    };

    const decrementBlood = (type: string) => {
        updateBloodType(type, 'available', inventory[type].available - 1);
    };

    const handleSubmit = async () => {
        if (!organization) return;
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            if (!supabase) {
                // Mock success for development
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSuccess(true);
                setLastUpdated(new Date().toLocaleString());
                return;
            }

            const orgId = organization.bloodBankId || organization.hospitalId;

            // Upsert inventory for each blood type
            for (const type of BLOOD_TYPES) {
                await supabase.from('blood_inventory').upsert({
                    blood_bank_id: orgId,
                    blood_type: type,
                    units_available: inventory[type].available,
                    total_capacity: inventory[type].capacity,
                    expiring_soon: inventory[type].expiringSoon,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'blood_bank_id,blood_type' });
            }

            // Log submission
            await supabase.from('data_submission_logs').insert({
                organization_account_id: organization.id,
                organization_type: organization.organizationType,
                data_type: 'blood_inventory',
                summary: {
                    blood_types_updated: BLOOD_TYPES.length,
                    total_units: Object.values(inventory).reduce((sum, i) => sum + i.available, 0),
                }
            });

            setSuccess(true);
            setLastUpdated(new Date().toLocaleString());
        } catch (err: any) {
            setError(err.message || 'Failed to save inventory');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoChange = async () => {
        if (!organization || !supabase) return;
        setIsSaving(true);

        try {
            await supabase.from('data_submission_logs').insert({
                organization_account_id: organization.id,
                organization_type: organization.organizationType,
                data_type: 'no_change',
                summary: { message: 'No changes today' }
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const totalUnits = Object.values(inventory).reduce((sum, i) => sum + i.available, 0);
    const totalCapacity = Object.values(inventory).reduce((sum, i) => sum + i.capacity, 0);
    const fillPercentage = totalCapacity > 0 ? Math.round((totalUnits / totalCapacity) * 100) : 0;

    if (!organization) {
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
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Droplets className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Blood Inventory</h1>
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
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{totalUnits}</p>
                        <p className="text-sm text-gray-500">Total Units</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{totalCapacity}</p>
                        <p className="text-sm text-gray-500">Total Capacity</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className={`text-3xl font-bold ${fillPercentage < 30 ? 'text-red-600' :
                                fillPercentage < 60 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {fillPercentage}%
                        </p>
                        <p className="text-sm text-gray-500">Fill Rate</p>
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
                        Inventory updated successfully!
                    </div>
                )}

                {/* Blood Type Grid */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Update Blood Units</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {BLOOD_TYPES.map(type => (
                            <div key={type} className="border rounded-lg p-4 text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${type.includes('+') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    <span className="font-bold text-lg">{type}</span>
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <button
                                        onClick={() => decrementBlood(type)}
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <Input
                                        type="number"
                                        value={inventory[type].available}
                                        onChange={(e) => updateBloodType(type, 'available', parseInt(e.target.value) || 0)}
                                        className="w-16 text-center font-bold"
                                        min={0}
                                    />
                                    <button
                                        onClick={() => incrementBlood(type)}
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-xs text-gray-500">
                                    Capacity: {inventory[type].capacity}
                                </div>

                                {/* Fill bar */}
                                <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full ${(inventory[type].available / inventory[type].capacity) < 0.3 ? 'bg-red-500' :
                                                (inventory[type].available / inventory[type].capacity) < 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(100, (inventory[type].available / inventory[type].capacity) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Expiring Soon */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Units Expiring Soon (within 7 days)</h2>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {BLOOD_TYPES.map(type => (
                            <div key={type} className="text-center">
                                <label className="text-sm font-medium">{type}</label>
                                <Input
                                    type="number"
                                    value={inventory[type].expiringSoon}
                                    onChange={(e) => updateBloodType(type, 'expiringSoon', parseInt(e.target.value) || 0)}
                                    className="text-center"
                                    min={0}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Inventory</>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleNoChange}
                        disabled={isSaving}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        No Changes Today
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default InventoryFormPage;
