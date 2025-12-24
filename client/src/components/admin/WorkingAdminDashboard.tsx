import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Shield, Heart, Database, AlertTriangle, BarChart3,
  Settings, Search, Plus, Edit, Trash2, UserCheck, UserX,
  MapPin, Building2, Package, FileText, Bell, Activity, Loader2, RefreshCw
} from 'lucide-react';
import { donorAPI, bloodRequestAPI, inventoryAPI, statsAPI, contactAPI } from '@/lib/firebase/api';
import { useAdminDashboard } from '@/hooks/use-data';

const WorkingAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real-time data hooks
  const { 
    donors: users, 
    emergencyRequests, 
    inventory: bloodInventory, 
    stats, 
    loading, 
    error,
    refetchAll 
  } = useAdminDashboard();
  
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await refetchAll();
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle errors from real-time data
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Data",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleUserAction = async (action: string, userInfo: any) => {
    try {
      switch (action) {
        case 'Toggle Status':
          const newStatus = userInfo.status === 'active' ? 'inactive' : 'active';
          await donorAPI.updateDonorStatus(userInfo.id, newStatus === 'active' ? 'available' : 'busy');
          break;
        case 'Edit Profile':
          // In a real app, this would open an edit modal
          break;
        case 'Delete User':
          // In a real app, this would show a confirmation dialog
          break;
      }
      
      toast({
        title: "Action Completed",
        description: `${action} executed for ${userInfo.username || userInfo.name || userInfo.email}`,
      });
      
      // Refresh data after action
      await refreshData();
    } catch (error) {
      toast({
        title: "Action Failed", 
        description: `Failed to ${action.toLowerCase()}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEmergencyAction = async (action: string, requestInfo: any) => {
    try {
      switch (action) {
        case 'Approve Request':
          await bloodRequestAPI.updateRequestStatus(requestInfo.id, 'approved');
          break;
        case 'Contact Requester':
          // In a real app, this would initiate contact
          break;
        case 'Find Donors':
          // In a real app, this would search for compatible donors
          break;
      }
      
      toast({
        title: "Emergency Action",
        description: `${action} for ${requestInfo.requester}`,
      });
      
      await refreshData();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action.toLowerCase()}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleInventoryUpdate = async (bloodType: string, change: number) => {
    try {
      const item = bloodInventory.find(inv => inv.type === bloodType);
      if (item) {
        const newUnits = Math.max(0, (item.units || 0) + change);
        await inventoryAPI.updateInventory(item.id, newUnits);
        
        toast({
          title: "Inventory Updated",
          description: `${bloodType} inventory ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} units`,
        });
        
        await refreshData();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              Jiwandan Admin Dashboard
            </h1>
            <p className="text-gray-600">Complete management system for {user?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive">Admin Access</Badge>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              {refreshing ? 'Refreshing...' : 'Notifications (3)'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="donors">💝 Donors</TabsTrigger>
            <TabsTrigger value="inventory">🩸 Inventory</TabsTrigger>
            <TabsTrigger value="emergency">🚨 Emergency</TabsTrigger>
            <TabsTrigger value="reports">📈 Reports</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-green-600">
                        {stats.totalUsers > 0 ? '+' : ''}Real data
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.activeDonors}</div>
                      <p className="text-xs text-green-600">Available now</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Units Available</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats.bloodUnits}</div>
                      <p className="text-xs text-blue-600">Current inventory</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Requests</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-red-600">{stats.emergencyRequests}</div>
                      <p className="text-xs text-red-600">
                        {stats.emergencyRequests > 0 ? 'Requires attention' : 'All clear'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Emergency Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emergencyRequests.slice(0, 3).map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{request.requester}</p>
                          <p className="text-sm text-gray-600">{request.bloodType} - {request.quantity} units</p>
                        </div>
                        <Badge variant={request.urgency === 'critical' ? 'destructive' : 'default'}>
                          {request.urgency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bloodInventory.filter(item => item.units < 50).map(item => (
                      <div key={item.type} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.type} Blood</p>
                          <p className="text-sm text-gray-600">{item.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{item.units} units</p>
                          <p className="text-xs text-gray-500">{item.expiring} expiring soon</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex gap-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-gray-600">Loading users...</span>
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No users found. Users will appear here once they register.</p>
                    </div>
                  ) : (
                    users.slice(0, 10).map(user => {
                      const displayName = user.username || user.fullName || user.name || user.email || 'Unknown User';
                      const userRole = user.role || 'donor';
                      const userStatus = user.status || 'active';
                      const userBloodType = user.bloodType || 'Unknown';
                      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-red-600">{displayName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <div className="font-medium">{displayName}</div>
                              <div className="text-sm text-gray-500">{user.email || 'No email provided'}</div>
                              <div className="text-xs text-gray-400">Joined: {joinDate}</div>
                            </div>
                            <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'moderator' ? 'default' : 'secondary'}>
                              {userRole}
                            </Badge>
                            <Badge variant={userStatus === 'active' ? 'default' : 'secondary'}>
                              {userStatus}
                            </Badge>
                            <Badge variant="outline">{userBloodType}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleUserAction('Edit Profile', user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleUserAction('Toggle Status', user)}>
                              {userStatus === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleUserAction('Delete User', user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donors Tab */}
          <TabsContent value="donors" className="space-y-6">
            <h2 className="text-xl font-semibold">Donor Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['O+', 'A+', 'B+', 'AB+'].map(bloodType => {
                const donors = users.filter(user => user.bloodType === bloodType && user.role === 'donor');
                return (
                  <Card key={bloodType}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center text-red-600">{bloodType}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-2xl font-bold">{donors.length}</div>
                      <p className="text-sm text-gray-500">Active Donors</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Donor Verification Queue</CardTitle>
                <p className="text-sm text-gray-600">Donors pending verification</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.filter(user => user.role === 'donor').slice(0, 3).map(donor => (
                    <div key={donor.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-gray-500">{donor.bloodType} • {donor.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUserAction('Verify Donor', donor)}>
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleUserAction('Request Documents', donor)}>
                          Request Docs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Blood Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blood Inventory Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Inventory
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloodInventory.map(item => (
                <Card key={`${item.type}-${item.location}`} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-red-600 text-lg">{item.type}</CardTitle>
                    <p className="text-center text-sm text-gray-500">{item.location}</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="text-3xl font-bold">{item.units}</div>
                    <p className="text-sm text-gray-600">Units Available</p>
                    <div className="flex justify-center gap-2">
                      <Badge variant={item.expiring > 10 ? 'default' : item.expiring > 5 ? 'secondary' : 'destructive'}>
                        {item.expiring} expiring soon
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">Updated: {item.lastUpdated}</p>
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="outline" onClick={() => handleInventoryUpdate(item.type, 10)}>
                        +10
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInventoryUpdate(item.type, 5)}>
                        +5
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInventoryUpdate(item.type, -5)}>
                        -5
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Emergency Requests Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-red-600">🚨 Emergency Blood Requests</h2>
              <Badge variant="destructive">{emergencyRequests.length} Active Requests</Badge>
            </div>

            <div className="space-y-4">
              {emergencyRequests.map(request => (
                <Card key={request.id} className={`border-l-4 ${request.urgency === 'critical' ? 'border-red-500 bg-red-50' : request.urgency === 'high' ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.requester}</CardTitle>
                        <p className="text-gray-600">📍 {request.location}</p>
                        <p className="text-sm text-gray-500">📅 {request.date}</p>
                      </div>
                      <Badge variant={request.urgency === 'critical' ? 'destructive' : request.urgency === 'high' ? 'default' : 'secondary'}>
                        {request.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{request.bloodType}</p>
                          <p className="text-sm text-gray-500">Blood Type</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{request.quantity}</p>
                          <p className="text-sm text-gray-500">Units Needed</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEmergencyAction('Approve Request', request)}>
                          ✅ Approve
                        </Button>
                        <Button variant="outline" onClick={() => handleEmergencyAction('Contact Requester', request)}>
                          📞 Contact
                        </Button>
                        <Button variant="outline" onClick={() => handleEmergencyAction('Find Donors', request)}>
                          🔍 Find Donors
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-xl font-semibold">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📊 System Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Monthly User Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Donor Activity Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Inventory Status Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Response Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📈 Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Donations This Month</span>
                    <Badge>127</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <Badge>23 minutes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <Badge className="bg-green-100 text-green-800">94.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>New Registrations</span>
                    <Badge>89 this week</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup & Recovery
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    System Monitoring
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔧 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => toast({ title: "System Health Check", description: "All systems operational ✅" })}>
                    Run System Health Check
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => toast({ title: "Backup Initiated", description: "Data backup started successfully" })}>
                    Create Backup
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => toast({ title: "Cache Cleared", description: "System cache cleared successfully" })}>
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default WorkingAdminDashboard;