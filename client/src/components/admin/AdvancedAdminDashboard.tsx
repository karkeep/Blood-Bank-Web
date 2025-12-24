import React, { useState } from 'react';
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
  MapPin, Building2, Package, FileText, Bell, Activity
} from 'lucide-react';
const AdvancedAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data - replace with real API calls
  const [stats] = useState({
    totalUsers: 2547, activeDonors: 856, pendingRequests: 23,
    bloodUnits: 1247, emergencyRequests: 7, moderators: 12
  });

  const [users] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'donor', status: 'active', bloodType: 'O+' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', status: 'active', bloodType: 'A-' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'volunteer', status: 'inactive', bloodType: 'B+' }
  ]);

  const [emergencyRequests] = useState([
    { id: '1', requester: 'Hospital A', bloodType: 'O-', quantity: 5, urgency: 'critical', location: 'NYC' },
    { id: '2', requester: 'Clinic B', bloodType: 'A+', quantity: 3, urgency: 'high', location: 'LA' }
  ]);

  const [bloodInventory] = useState([
    { type: 'O+', units: 156, location: 'Central Bank', expiring: 12 },
    { type: 'A+', units: 89, location: 'North Bank', expiring: 5 },
    { type: 'B+', units: 67, location: 'South Bank', expiring: 8 },
    { type: 'AB+', units: 34, location: 'East Bank', expiring: 3 }
  ]);

  const [roleStats] = useState({
    admins: 5, moderators: 12, volunteers: 45, donors: 1856, users: 629
  });

  const handleUserAction = (action: string, userId: string) => {
    toast({ title: "Action Completed", description: `${action} executed for user ${userId}` });
  };

  const handleEmergencyAction = (action: string, requestId: string) => {
    toast({ title: "Emergency Action", description: `${action} for request ${requestId}` });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
  };

  const handleInventoryUpdate = (bloodType: string, change: number) => {
    toast({ title: "Inventory Updated", description: `${bloodType} inventory ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} units` });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          Advanced Admin Dashboard
        </h1>
        <p className="text-gray-600">Complete blood bank management system</p>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4"/>Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4"/>Active Donors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeDonors}</div>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4"/>Blood Units
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bloodUnits}</div>
                  <p className="text-xs text-red-600">-3% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500"/>Emergencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.emergencyRequests}</div>
                  <p className="text-xs text-orange-600">Requires immediate attention</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5"/>User Management ({users.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Search users..." className="w-64" />
                  <Button><Plus className="h-4 w-4 mr-2"/>Add User</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge>
                        <Badge variant="outline">{user.bloodType}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleUserAction('Edit', user.id)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleUserAction('Toggle Status', user.id)}>
                          {user.status === 'active' ? <UserX className="h-4 w-4"/> : <UserCheck className="h-4 w-4"/>}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleUserAction('Delete', user.id)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600"/>Role Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Super Admins</span>
                    <Badge variant="destructive">{roleStats.admins}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Moderators</span>
                    <Badge variant="secondary">{roleStats.moderators}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Volunteers</span>
                    <Badge variant="outline">{roleStats.volunteers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Donors</span>
                    <Badge className="bg-green-100 text-green-800">{roleStats.donors}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Regular Users</span>
                    <Badge variant="outline">{roleStats.users}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Emergency Requests Tab */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5"/>Critical Emergency Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyRequests.map(request => (
                    <div key={request.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{request.requester}</h3>
                          <p className="text-sm text-gray-600">Blood Type: {request.bloodType} | Quantity: {request.quantity} units</p>
                          <p className="text-sm text-gray-500">Location: {request.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={request.urgency === 'critical' ? 'destructive' : 'default'}>
                            {request.urgency}
                          </Badge>
                          <Button size="sm" onClick={() => handleEmergencyAction('Approve', request.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEmergencyAction('Contact', request.id)}>
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5"/>Blood Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bloodInventory.map(item => (
                    <Card key={item.type} className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-red-600">{item.type}</h3>
                        <p className="text-2xl font-bold">{item.units} units</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                        <p className="text-xs text-orange-600">{item.expiring} expiring soon</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleInventoryUpdate(item.type, 10)}>
                            +10
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleInventoryUpdate(item.type, -5)}>
                            -5
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5"/>System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">Notification Settings</Button>
                  <Button className="w-full justify-start">Security Settings</Button>
                  <Button className="w-full justify-start">Backup & Recovery</Button>
                  <Button className="w-full justify-start">Integration Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;