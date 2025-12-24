import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { dbService, UserSchema, DonorProfileSchema, EmergencyRequestSchema } from '@/lib/firebase/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import {
  Users, Droplet, AlertTriangle, Activity, TrendingUp, TrendingDown,
  Heart, Building2, Calendar, Bell, Zap, RefreshCw
} from 'lucide-react';

// Components for different admin sections
import UserManagement from './UserManagement';
import DonorManagement from './DonorManagement';
import BloodInventory from './BloodInventory';
import EmergencyRequests from './EmergencyRequests';
import AdminStats from './AdminStats';

// Premium UI Components
import { PageLoader, BloodDropLoader } from '@/components/ui/blood-loader';
import { GlassStatCard } from '@/components/ui/glass-stat-card';
import { LiveActivityFeed } from '@/components/ui/live-activity-feed';
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';

// Supabase Hooks
import { useSupabaseStats, useBloodInventoryStatus } from '@/hooks/use-supabase-stats';
import { useLiveActivityFeed } from '@/hooks/use-supabase-realtime';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Use Supabase hooks with fallback
  const { stats: supabaseStats, isLoading: statsLoading, refetch: refetchStats } = useSupabaseStats();
  const { activities, isConnected: realtimeConnected } = useLiveActivityFeed({ enabled: true });
  const { inventory: bloodInventory } = useBloodInventoryStatus();

  // Local stats state (merged from Firebase and Supabase)
  const [stats, setStats] = useState({
    users: 0,
    donors: 0,
    pendingRequests: 0,
    pendingVerifications: 0,
    inventory: {} as Record<string, number>,
    livesSaved: 0,
    totalDonations: 0,
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Load initial stats from Firebase
    const loadStats = async () => {
      try {
        // Get all users (with type assertion)
        const users = await dbService.getAll('users') as UserSchema[];
        const donors = users.filter((u: UserSchema) => u.role === 'donor');

        // Get emergency requests (Active and Matching = pending requests)
        const requests = await dbService.getAll('emergencyRequests') as EmergencyRequestSchema[];
        const pendingRequests = requests.filter((r: EmergencyRequestSchema) => r.status === 'Active' || r.status === 'Matching');

        // Get donor profiles pending verification
        const donorProfiles = await dbService.getAll('donorProfiles') as DonorProfileSchema[];
        const pendingVerifications = donorProfiles.filter((p: DonorProfileSchema) => p.verificationStatus === 'Pending');

        // Get blood inventory
        interface BloodInventoryItem { bloodType: string; unitsAvailable: number; }
        const inventory = await dbService.getAll('bloodInventory') as BloodInventoryItem[];
        const inventoryByType = inventory.reduce((acc: Record<string, number>, item: BloodInventoryItem) => {
          if (!acc[item.bloodType]) {
            acc[item.bloodType] = 0;
          }
          acc[item.bloodType] += item.unitsAvailable;
          return acc;
        }, {} as Record<string, number>);

        // Calculate lives saved (estimate: 3 lives per donation)
        const livesSaved = donorProfiles.reduce((acc: number, p: DonorProfileSchema) => acc + ((p.totalDonations || 0) * 3), 0);
        const totalDonations = donorProfiles.reduce((acc: number, p: DonorProfileSchema) => acc + (p.totalDonations || 0), 0);

        setStats({
          users: users.length,
          donors: donors.length,
          pendingRequests: pendingRequests.length,
          pendingVerifications: pendingVerifications.length,
          inventory: inventoryByType,
          livesSaved,
          totalDonations,
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, navigate]);

  // Merge Supabase stats when available
  useEffect(() => {
    if (supabaseStats) {
      setStats(prev => ({
        ...prev,
        totalDonations: supabaseStats.totalDonations || prev.totalDonations,
        livesSaved: supabaseStats.livesSaved || prev.livesSaved,
      }));
    }
  }, [supabaseStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return <PageLoader message="Loading admin dashboard..." />;
  }

  // Calculate trend (mock data - would come from Supabase in production)
  const usersTrend = 12; // +12%
  const donorsTrend = 8; // +8%
  const requestsTrend = -5; // -5% (less requests is good)
  const inventoryTrend = 3; // +3%

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Admin Dashboard
              </h1>
              <p className="text-red-100 mt-1">Jiwandan Blood Bank Management</p>
            </div>
            <div className="flex items-center gap-4">
              {realtimeConnected && (
                <Badge className="bg-green-500/20 text-green-100 border-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Live
                </Badge>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Stats Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Premium Glass Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassStatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    trend={{ value: usersTrend, isPositive: true }}
                    variant="default"
                    onClick={() => setActiveTab('users')}
                  />
                  <GlassStatCard
                    title="Active Donors"
                    value={stats.donors}
                    icon={Heart}
                    trend={{ value: donorsTrend, isPositive: true }}
                    variant="blood"
                    subtitle={`${stats.pendingVerifications} pending verification`}
                    onClick={() => setActiveTab('donors')}
                  />
                  <GlassStatCard
                    title="Lives Saved"
                    value={stats.livesSaved}
                    icon={Zap}
                    trend={{ value: 15, isPositive: true }}
                    variant="life"
                    subtitle="Through blood donations"
                  />
                  <GlassStatCard
                    title="Emergency Requests"
                    value={stats.pendingRequests}
                    icon={AlertTriangle}
                    trend={{ value: Math.abs(requestsTrend), isPositive: requestsTrend < 0 }}
                    variant="warning"
                    subtitle="Requires attention"
                    onClick={() => setActiveTab('requests')}
                  />
                </div>

                {/* Blood Inventory Overview */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-red-500" />
                      Blood Inventory Status
                    </CardTitle>
                    <CardDescription>Current blood units by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(stats.inventory).length > 0 ? (
                        Object.entries(stats.inventory).map(([type, units]) => (
                          <div
                            key={type}
                            className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-100 dark:border-red-800"
                          >
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {type}
                            </div>
                            <div className="text-lg font-semibold mt-1">{units}</div>
                            <div className="text-xs text-muted-foreground">units</div>
                          </div>
                        ))
                      ) : (
                        ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                          <div
                            key={type}
                            className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                          >
                            <div className="text-2xl font-bold text-gray-400">{type}</div>
                            <div className="text-lg font-semibold mt-1 text-gray-300">--</div>
                            <div className="text-xs text-muted-foreground">units</div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('inventory')}>
                      Manage Inventory
                    </Button>
                  </CardFooter>
                </Card>

                {/* Additional Stats */}
                <AdminStats />
              </div>

              {/* Live Activity Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <LiveActivityFeed
                    activities={activities.map(a => ({
                      id: a.id,
                      type: a.type as 'donation' | 'request' | 'match' | 'fulfillment' | 'registration',
                      title: a.title,
                      description: a.description,
                      bloodType: a.bloodType,
                      location: a.location,
                      timestamp: a.timestamp,
                    }))}
                    maxItems={8}
                    className="h-[600px]"
                  />

                  {/* Quick Actions */}
                  <Card className="mt-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-2" />
                        Send Notification
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Blood Drive
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Building2 className="h-4 w-4 mr-2" />
                        Add Blood Bank
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="donors">
            <DonorManagement />
          </TabsContent>

          <TabsContent value="inventory">
            <BloodInventory />
          </TabsContent>

          <TabsContent value="requests">
            <EmergencyRequests />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

