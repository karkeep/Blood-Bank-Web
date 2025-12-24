import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  UserCog, 
  Search, 
  Ban, 
  Calendar, 
  Check, 
  Clock, 
  Eye 
} from 'lucide-react';

const ModeratorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  
  // Fetch users based on moderator's access level
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Moderators can only manage volunteers and regular users
        const response = await fetch('/api/roles/users', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, toast]);
  
  // Filter users based on search query and role filter
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.fullName?.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter]);
  
  // Fetch verification requests, reports, etc.
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // For demonstration, create mock data
        // In a real app, these would come from API endpoints
        
        // Mock verification requests
        setRequests([
          {
            id: 1,
            type: 'DocumentVerification',
            userId: 5,
            username: 'donor5',
            fullName: 'Rahul Sharma',
            documentType: 'ID Card',
            submittedDate: '2025-05-15T10:30:00',
            status: 'Pending'
          },
          {
            id: 2,
            type: 'ProfileVerification',
            userId: 8,
            username: 'donor8',
            fullName: 'Anjali Patel',
            submittedDate: '2025-05-18T14:45:00',
            status: 'Pending'
          }
        ]);
        
        // Mock user reports
        setReports([
          {
            id: 1,
            reporterId: 10,
            reporterName: 'Sanjay Kumar',
            reportedUserId: 15,
            reportedUsername: 'user15',
            reportedFullName: 'Manish Singh',
            reason: 'Inappropriate behavior',
            details: 'User was asking for personal information and being aggressive.',
            date: '2025-05-16T09:20:00',
            status: 'Pending'
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Handle updating a user's status
  const handleUpdateStatus = async (userId, status, reason = '') => {
    try {
      const response = await fetch('/api/roles/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ 
          userId, 
          status,
          reason,
          // For suspension, set end date to 7 days from now
          suspensionEndDate: status === 'suspended' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${status} user`);
      }
      
      const updatedUser = await response.json();
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      toast({
        title: 'Success',
        description: `User ${status === 'active' ? 'activated' : status}`,
      });
    } catch (error) {
      console.error(`Error ${status} user:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle approving or rejecting verification requests
  const handleVerificationRequest = async (requestId, approve) => {
    try {
      // In a real app, this would call an API endpoint
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: approve ? 'Approved' : 'Rejected' } 
            : req
        )
      );
      
      toast({
        title: 'Success',
        description: `Request ${approve ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error(`Error handling request:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle resolving reports
  const handleResolveReport = async (reportId, action) => {
    try {
      // In a real app, this would call an API endpoint
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'Resolved', resolution: action } 
            : report
        )
      );
      
      toast({
        title: 'Success',
        description: `Report resolved successfully`,
      });
    } catch (error) {
      console.error(`Error resolving report:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Define columns for the users table
  const userColumns = [
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
    },
    {
      accessorKey: 'bloodType',
      header: 'Blood Type',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge className={
          row.original.role === 'volunteer' ? 'bg-emerald-600' :
          row.original.role === 'donor' ? 'bg-blue-600' :
          'bg-gray-600'
        }>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
          !row.original.status || row.original.status === 'active' ? 'bg-green-600' :
          row.original.status === 'suspended' ? 'bg-amber-600' :
          row.original.status === 'banned' ? 'bg-red-600' :
          'bg-gray-600'
        }>
          {row.original.status || 'active'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const userData = row.original;
        
        // Current user can't modify themselves
        if (userData.id === user.id) {
          return <span className="text-gray-400">Current user</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            {/* View Profile button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Use the router for navigation instead of direct window.location
                const profileUrl = `/profile/${userData.id}`;
                // If using wouter, import { useLocation } from "wouter" and use its navigation
                // setLocation(profileUrl)
                window.location.href = profileUrl;
              }}
              title="View Profile"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            
            {/* Ban/Suspend/Activate buttons */}
            {userData.status === 'active' || !userData.status ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(userData.id, 'suspended')}
                  title="Suspend"
                >
                  <Clock className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUpdateStatus(userData.id, 'banned')}
                  title="Ban"
                >
                  <Ban className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(userData.id, 'active')}
                title="Activate"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  
  // Define columns for the requests table
  const requestColumns = [
    {
      accessorKey: 'type',
      header: 'Request Type',
    },
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
    },
    {
      accessorKey: 'documentType',
      header: 'Document Type',
      cell: ({ row }) => row.original.documentType || 'Profile',
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted',
      cell: ({ row }) => new Date(row.original.submittedDate).toLocaleString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
          row.original.status === 'Approved' ? 'bg-green-600' :
          row.original.status === 'Rejected' ? 'bg-red-600' :
          'bg-amber-600'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.status !== 'Pending') {
          return <span className="text-gray-400">Processed</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerificationRequest(row.original.id, true)}
              title="Approve"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleVerificationRequest(row.original.id, false)}
              title="Reject"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Define columns for the reports table
  const reportColumns = [
    {
      accessorKey: 'reportedUsername',
      header: 'Reported User',
    },
    {
      accessorKey: 'reporterName',
      header: 'Reported By',
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.date).toLocaleString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
          row.original.status === 'Resolved' ? 'bg-green-600' :
          'bg-amber-600'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.status !== 'Pending') {
          return <span className="text-gray-400">Resolved</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolveReport(row.original.id, 'Warned')}
              title="Warn User"
            >
              <Shield className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleResolveReport(row.original.id, 'Banned');
                handleUpdateStatus(row.original.reportedUserId, 'banned', row.original.reason);
              }}
              title="Ban User"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Moderator Dashboard</h1>
      
      <Tabs defaultValue="users" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>Verification Requests</span>
            {requests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <Ban className="h-4 w-4" />
            <span>Reports</span>
            {reports.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {reports.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Moderate users and volunteers</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="volunteer">Volunteers</SelectItem>
                    <SelectItem value="donor">Donors</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DataTable
                columns={userColumns}
                data={filteredUsers}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>Approve or reject user verification requests</CardDescription>
            </CardHeader>
            
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending verification requests
                </div>
              ) : (
                <DataTable
                  columns={requestColumns}
                  data={requests}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Handle user reports and complaints</CardDescription>
            </CardHeader>
            
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending reports
                </div>
              ) : (
                <DataTable
                  columns={reportColumns}
                  data={reports}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;