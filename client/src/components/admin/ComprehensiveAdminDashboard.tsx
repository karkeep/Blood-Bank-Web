import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Shield, Heart, Database, AlertTriangle, 
  BarChart3, Settings, Search, Plus, Edit, Trash2,
  UserCheck, UserX, MapPin, Building2, Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ComprehensiveAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real API calls
  const [stats, setStats] = useState({
    totalUsers: 2547,
    activeDonors: 856,
    pendingRequests: 23,
    bloodUnits: 1247,
    emergencyRequests: 7,
    moderators: 12,
    admins: 5
  });

  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'donor', status: 'active', bloodType: 'O+' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', status: 'active', bloodType: 'A-' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'volunteer', status: 'inactive', bloodType: 'B+' }
  ]);

  const [emergencyRequests, setEmergencyRequests] = useState([
    { id: '1', requester: 'Hospital A', bloodType: 'O-', quantity: 5, urgency: 'critical', location: 'NYC' },
    { id: '2', requester: 'Clinic B', bloodType: 'A+', quantity: 3, urgency: 'high', location: 'LA' }
  ]);

  const [bloodInventory, setBloodInventory] = useState([
    { type: 'O+', units: 156, location: 'Central Bank', expiring: 12 },
    { type: 'A+', units: 89, location: 'North Bank', expiring: 5 },
    { type: 'B+', units: 67, location: 'South Bank', expiring: 8 },
    { type: 'AB+', units: 34, location: 'East Bank', expiring: 3 }
  ]);

  // Overview Dashboard
  const OverviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDonors}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Units</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bloodUnits}</div>
            <p className="text-xs text-muted-foreground">-3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergencyRequests}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Advanced Admin Dashboard
          </h1>
          <p className="text-gray-600">Complete blood bank management system</p>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
          </TabsContent>

          {/* I'll continue with other sections in follow-up components */}
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;