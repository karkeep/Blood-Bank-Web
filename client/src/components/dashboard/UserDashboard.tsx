import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { dbService, UserSchema, EmergencyRequestSchema, DonorProfileSchema } from '@/lib/firebase/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import {
  Droplet,
  Calendar,
  Award,
  AlertTriangle,
  UserPlus,
  MapPin,
  Clock,
  Activity,
  Heart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

// Import potentially missing components
import DonorMap from './DonorMap';
import EmergencyRequestCard from './EmergencyRequestCard';
import BloodInventoryChart from './BloodInventoryChart';
import NotificationList from './NotificationList';

// Import premium UI components
import { BloodDropLoader, PageLoader } from '@/components/ui/blood-loader';
import { GlassStatCard } from '@/components/ui/glass-stat-card';
import { LiveActivityFeed } from '@/components/ui/live-activity-feed';
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';

// Import Supabase hooks (optional - falls back to Firebase data)
import { useSupabaseStats } from '@/hooks/use-supabase-stats';
import { useLiveActivityFeed } from '@/hooks/use-supabase-realtime';

const UserDashboard = () => {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<DonorProfileSchema | null>(null);
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequestSchema[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<(UserSchema & { distance?: number })[]>([]);
  const [bloodInventory, setBloodInventory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load emergency requests
        const requests = await dbService.getActiveEmergencyRequests();
        setEmergencyRequests(requests);

        // Load blood inventory by city
        const inventory = await dbService.getAll('bloodInventory');
        setBloodInventory(inventory);

        // Load user notifications
        if (user) {
          const userNotifications = await dbService.getUserNotifications(user.id);
          setNotifications(userNotifications);

          // Load donor profile if user is a donor
          if (user.role === 'donor') {
            try {
              const profile = await dbService.getDonorProfile(user.id);
              setDonorProfile(profile);
            } catch (error) {
              console.log('No donor profile found or error loading donor profile:', error);
            }
          }
        }

        // If user is a donor and has location data, find nearby donors
        if (user?.role === 'donor' && user.location?.latitude && user.location?.longitude) {
          const donors = await dbService.findNearbyDonors(
            user.location.latitude,
            user.location.longitude,
            user.bloodType,
            25 // 25km radius
          );
          setNearbyDonors(donors);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Get stats from Supabase hooks (with fallback to mock data)
  const { stats, isLoading: statsLoading } = useSupabaseStats();
  const { activities, isConnected: activityConnected } = useLiveActivityFeed({ enabled: true });

  if (loading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  // Filter emergency requests by blood type compatibility
  const compatibleRequests = emergencyRequests.filter(request => {
    // Simplified blood compatibility check
    if (!user) return false;

    if (request.bloodType === user.bloodType) return true;

    // O- can donate to anyone
    if (user.bloodType === 'O-') return true;

    // O+ can donate to A+, B+, AB+, O+
    if (user.bloodType === 'O+' && request.bloodType.endsWith('+')) return true;

    // A- can donate to A+, A-, AB+, AB-
    if (user.bloodType === 'A-' && (request.bloodType.startsWith('A') || request.bloodType.startsWith('AB'))) return true;

    // A+ can donate to A+, AB+
    if (user.bloodType === 'A+' && (request.bloodType === 'A+' || request.bloodType === 'AB+')) return true;

    // B- can donate to B+, B-, AB+, AB-
    if (user.bloodType === 'B-' && (request.bloodType.startsWith('B') || request.bloodType.startsWith('AB'))) return true;

    // B+ can donate to B+, AB+
    if (user.bloodType === 'B+' && (request.bloodType === 'B+' || request.bloodType === 'AB+')) return true;

    // AB- can donate to AB+, AB-
    if (user.bloodType === 'AB-' && request.bloodType.startsWith('AB')) return true;

    // AB+ can only donate to AB+
    if (user.bloodType === 'AB+' && request.bloodType === 'AB+') return true;

    return false;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground">
            Blood Type: <Badge variant="outline">{user?.bloodType}</Badge>
          </p>
        </div>

        {user?.role === 'admin' && (
          <Button onClick={() => navigate('/admin')} className="mt-2 md:mt-0">
            Admin Dashboard
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Emergency Requests</TabsTrigger>
          <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Donor Status Card (if user is a donor) */}
            {user?.role === 'donor' && donorProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplet className="w-5 h-5 mr-2 text-red-500" />
                    Donor Status
                  </CardTitle>
                  <CardDescription>Your current donation status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={donorProfile.status === 'Available' ? 'default' : 'secondary'}>
                        {donorProfile.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification:</span>
                      <Badge variant={
                        donorProfile.verificationStatus === 'Verified' ? 'default' :
                          donorProfile.verificationStatus === 'Pending' ? 'secondary' :
                            'destructive'
                      }>
                        {donorProfile.verificationStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Badge:</span>
                      <Badge variant="outline" className={
                        donorProfile.badge === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          donorProfile.badge === 'Silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                      }>
                        <Award className="w-3 h-3 mr-1" /> {donorProfile.badge}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Donations:</span>
                      <span className="font-medium">{donorProfile.totalDonations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lives Saved:</span>
                      <span className="font-medium">{donorProfile.livesSaved}</span>
                    </div>

                    {donorProfile.nextEligibleDate && (
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span>Next Eligible Date:</span>
                          <span className="font-medium">
                            {new Date(donorProfile.nextEligibleDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Progress
                          value={calculateEligibilityProgress(donorProfile.lastDonationDate, donorProfile.nextEligibleDate)}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                    Update Profile
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Emergency Requests Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  Emergency Requests
                </CardTitle>
                <CardDescription>Recent blood requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Requests:</span>
                    <span className="font-medium">{emergencyRequests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compatible with You:</span>
                    <span className="font-medium">{compatibleRequests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Urgency:</span>
                    <span className="font-medium">
                      {emergencyRequests.filter(r => r.urgency === 'Critical').length}
                    </span>
                  </div>

                  {compatibleRequests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Compatible Requests:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {compatibleRequests.slice(0, 3).map(request => (
                          <div key={request.id} className="flex justify-between items-center text-sm">
                            <div>
                              <Badge variant="outline">{request.bloodType}</Badge>
                              <span className="ml-2">{request.hospitalCity}</span>
                            </div>
                            <Badge variant={
                              request.urgency === 'Critical' ? 'destructive' :
                                request.urgency === 'Urgent' ? 'default' :
                                  'secondary'
                            }>
                              {request.urgency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => navigate('/requests')}>
                    View All
                  </Button>
                  {user?.role === 'requester' && (
                    <Button onClick={() => navigate('/create-request')}>
                      Create Request
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Blood Inventory Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Blood Inventory
                </CardTitle>
                <CardDescription>Current blood availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bloodInventory.length > 0 ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your Blood Type ({user?.bloodType}):</h4>
                        {bloodInventory
                          .filter(item => item.bloodType === user?.bloodType)
                          .slice(0, 3)
                          .map(item => (
                            <div key={item.id} className="flex justify-between items-center mb-1 text-sm">
                              <span>{item.cityName}:</span>
                              <div className="flex items-center">
                                <span className="font-medium mr-2">{item.unitsAvailable} units</span>
                                <Badge variant={
                                  item.status === 'Critical' ? 'destructive' :
                                    item.status === 'Low' ? 'default' :
                                      'secondary'
                                }>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Critical Shortages:</h4>
                        {bloodInventory
                          .filter(item => item.status === 'Critical')
                          .slice(0, 3)
                          .map(item => (
                            <div key={item.id} className="flex justify-between items-center mb-1 text-sm">
                              <div>
                                <Badge variant="outline">{item.bloodType}</Badge>
                                <span className="ml-1">{item.cityName}</span>
                              </div>
                              <span className="font-medium">{item.unitsAvailable} units</span>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center py-4">
                      No inventory data available
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/inventory')}>
                  View Full Inventory
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
            {notifications.length > 0 ? (
              <div className="rounded-md border">
                {notifications.slice(0, 5).map(notification => (
                  <div key={notification.id} className="border-b p-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <Badge variant={notification.read ? 'outline' : 'default'}>
                        {notification.read ? 'Read' : 'New'}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No new notifications</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Nearby Donors Map (if user is a donor) */}
          {user?.role === 'donor' && user.location?.latitude && user.location?.longitude && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Nearby Donors</h2>
              <Card>
                <CardContent className="p-0 h-80">
                  <div className="h-full w-full rounded-md overflow-hidden">
                    {nearbyDonors.length > 0 ? (
                      <DonorMap
                        donors={nearbyDonors}
                        userLocation={{
                          lat: user.location.latitude,
                          lng: user.location.longitude
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <MapPin className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No nearby donors found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyRequests.length > 0 ? (
              emergencyRequests.map(request => (
                <EmergencyRequestCard
                  key={request.id}
                  request={request}
                  isCompatible={compatibleRequests.some(r => r.id === request.id)}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Emergency Requests</h3>
                    <p className="text-muted-foreground">
                      There are currently no active emergency blood requests.
                    </p>
                    {user?.role === 'requester' && (
                      <Button className="mt-4" onClick={() => navigate('/create-request')}>
                        Create New Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <BloodInventoryChart inventory={bloodInventory} userBloodType={user?.bloodType} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate eligibility progress percentage
function calculateEligibilityProgress(lastDonationDate: any, nextEligibleDate: any): number {
  if (!lastDonationDate || !nextEligibleDate) return 0;

  const lastDate = new Date(lastDonationDate).getTime();
  const nextDate = new Date(nextEligibleDate).getTime();
  const now = Date.now();

  // Calculate time passed since last donation
  const timePassed = now - lastDate;
  const totalTime = nextDate - lastDate;

  // Calculate percentage
  const percentage = (timePassed / totalTime) * 100;

  // Clamp value between 0 and 100
  return Math.min(Math.max(percentage, 0), 100);
}

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export default UserDashboard;
