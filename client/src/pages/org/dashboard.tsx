/**
 * Organization Dashboard
 * Main dashboard for hospitals and blood banks after login
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
    Building2, Droplets, LayoutDashboard, Package, Bed, Bell,
    LogOut, RefreshCw, Calendar, Clock, CheckCircle, AlertCircle,
    TrendingUp, Users, Activity, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOrganizationAuth } from '@/hooks/use-organization-auth';

export function OrganizationDashboardPage() {
    const [, navigate] = useLocation();
    const { organization, logout, isLoading } = useOrganizationAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'rooms' | 'settings'>('overview');

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !organization) {
            navigate('/org/login');
        }
    }, [organization, isLoading, navigate]);

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate('/org/login');
    };

    const isHospital = organization.organizationType === 'hospital';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isHospital ? 'bg-blue-100' : 'bg-red-100'}`}>
                            {isHospital ? (
                                <Building2 className={`w-6 h-6 text-blue-600`} />
                            ) : (
                                <Droplets className={`w-6 h-6 text-red-600`} />
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">{organization.organizationName || 'Organization'}</h1>
                            <p className="text-sm text-gray-500">{isHospital ? 'Hospital' : 'Blood Bank'} Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                            <Bell className="w-5 h-5" />
                        </Button>
                        <div className="text-right">
                            <p className="text-sm font-medium">{organization.contactName}</p>
                            <p className="text-xs text-gray-500">{organization.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Blood Inventory
                    </button>
                    {isHospital && (
                        <button
                            onClick={() => setActiveTab('rooms')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'rooms' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Bed className="w-4 h-4" />
                            Room Availability
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="p-4 border-l-4 border-l-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Today's Status</p>
                                        <p className="text-2xl font-bold text-green-600">Submitted</p>
                                    </div>
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                            </Card>

                            <Card className="p-4 border-l-4 border-l-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Submission Streak</p>
                                        <p className="text-2xl font-bold text-blue-600">12 days</p>
                                    </div>
                                    <TrendingUp className="w-10 h-10 text-blue-500" />
                                </div>
                            </Card>

                            <Card className="p-4 border-l-4 border-l-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Blood Units</p>
                                        <p className="text-2xl font-bold text-red-600">247</p>
                                    </div>
                                    <Droplets className="w-10 h-10 text-red-500" />
                                </div>
                            </Card>

                            {isHospital && (
                                <Card className="p-4 border-l-4 border-l-purple-500">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">ICU Available</p>
                                            <p className="text-2xl font-bold text-purple-600">8/20</p>
                                        </div>
                                        <Bed className="w-10 h-10 text-purple-500" />
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-red-600" />
                                    Update Blood Inventory
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Submit today's blood inventory data to keep the public informed.
                                </p>
                                <Button
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    onClick={() => navigate('/org/inventory')}
                                >
                                    Update Inventory
                                </Button>
                            </Card>

                            {isHospital && (
                                <Card className="p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Bed className="w-5 h-5 text-blue-600" />
                                        Update Room Availability
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Update ICU, ER, and general bed availability for public visibility.
                                    </p>
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={() => navigate('/org/rooms')}
                                    >
                                        Update Rooms
                                    </Button>
                                </Card>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-gray-600" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { action: 'Blood inventory updated', time: '2 hours ago', type: 'inventory' },
                                    { action: 'Room availability updated', time: '5 hours ago', type: 'rooms' },
                                    { action: 'Account login', time: 'Today at 8:00 AM', type: 'login' },
                                    { action: 'Blood inventory updated', time: 'Yesterday', type: 'inventory' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${item.type === 'inventory' ? 'bg-red-500' :
                                                    item.type === 'rooms' ? 'bg-blue-500' : 'bg-green-500'
                                                }`} />
                                            <span>{item.action}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Blood Inventory Management</h2>
                            <Button onClick={() => navigate('/org/inventory')}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Update Now
                            </Button>
                        </div>
                        <p className="text-gray-600">
                            Navigate to the inventory form to update your blood stock levels.
                        </p>
                    </Card>
                )}

                {/* Rooms Tab */}
                {activeTab === 'rooms' && isHospital && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Room Availability Management</h2>
                            <Button onClick={() => navigate('/org/rooms')}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Update Now
                            </Button>
                        </div>
                        <p className="text-gray-600">
                            Navigate to the room availability form to update ICU, ER, and general bed counts.
                        </p>
                    </Card>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Organization</label>
                                    <p className="font-medium">{organization.organizationName}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Type</label>
                                    <p className="font-medium capitalize">{organization.organizationType.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Contact Person</label>
                                    <p className="font-medium">{organization.contactName}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="font-medium">{organization.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Access Level</label>
                                    <p className="font-medium capitalize">{organization.accessLevel.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Status</label>
                                    <p className="font-medium text-green-600">
                                        {organization.isVerified ? 'Verified' : 'Pending Verification'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default OrganizationDashboardPage;
