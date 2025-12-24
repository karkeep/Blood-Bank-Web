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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  UserCog,
  AlertTriangle,
  Activity,
  BarChart4,
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
  Building,
  MapPin
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    totalModerators: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
    activeRequests: 0,
    totalDonations: 0,
    pendingVerifications: 0
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    bloodType: 'O+',
    role: 'admin',
  });
  
  // Helper function to generate mock users for development
  const getMockUsers = () => {
    const mockUsers = [
      {
        id: 1,
        username: 'superadmin',
        email: 'superadmin@jiwandan.org',
        fullName: 'Super Admin',
        bloodType: 'O+',
        role: 'superadmin',
        status: 'active',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        isAdmin: true
      },
      {
        id: 2,
        username: 'admin1',
        email: 'admin1@jiwandan.org',
        fullName: 'Admin User',
        bloodType: 'A+',
        role: 'admin',
        status: 'active',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        isAdmin: true
      },
      {
        id: 3,
        username: 'moderator1',
        email: 'moderator1@jiwandan.org',
        fullName: 'Moderator User',
        bloodType: 'B+',
        role: 'moderator',
        status: 'active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        username: 'volunteer1',
        email: 'volunteer1@jiwandan.org',
        fullName: 'Volunteer User',
        bloodType: 'AB+',
        role: 'volunteer',
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 5,
        username: 'donor1',
        email: 'donor1@jiwandan.org',
        fullName: 'Donor User',
        bloodType: 'O-',
        role: 'donor',
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 6,
        username: 'banneduser',
        email: 'banned@jiwandan.org',
        fullName: 'Banned User',
        bloodType: 'A-',
        role: 'user',
        status: 'banned',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      }
    ];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    
    // Calculate system statistics from mock data
    const stats = {
      totalUsers: mockUsers.length,
      totalDonors: mockUsers.filter(u => u.role === 'donor').length,
      totalVolunteers: mockUsers.filter(u => u.role === 'volunteer').length,
      totalModerators: mockUsers.filter(u => u.role === 'moderator').length,
      totalAdmins: mockUsers.filter(u => u.role === 'admin').length,
      newUsersThisMonth: 2,
      activeRequests: 15,
      totalDonations: 348,
      pendingVerifications: 7
    };
    
    setSystemStats(stats);
    setLoading(false);
    
    return mockUsers;
  };
  
  // Fetch all users - superadmin can see everyone
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let response;
        
        try {
          response = await fetch('/api/roles/users', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch users');
        } catch (fetchError) {
          console.error("Error fetching users from API:", fetchError);
          // In development, create mock data if API fails
          if (process.env.NODE_ENV === 'development') {
            console.log("Using mock data in development mode");
            return getMockUsers();
          } else {
            throw fetchError;
          }
        }
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
        
        // Calculate system statistics
        const stats = {
          totalUsers: data.length,
          totalDonors: data.filter(u => u.role === 'donor').length,
          totalVolunteers: data.filter(u => u.role === 'volunteer').length,
          totalModerators: data.filter(u => u.role === 'moderator').length,
          totalAdmins: data.filter(u => u.role === 'admin').length,
          newUsersThisMonth: data.filter(u => {
            const createdAt = new Date(u.createdAt);
            const now = new Date();
            return createdAt.getMonth() === now.getMonth() && 
                   createdAt.getFullYear() === now.getFullYear();
          }).length,
          activeRequests: 15, // Mock value
          totalDonations: 348, // Mock value
          pendingVerifications: 7 // Mock value
        };
        
        setSystemStats(stats);
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
  
  // Fetch deletion requests
  useEffect(() => {
    if (!user) return;
    
    const fetchDeletionRequests = async () => {
      try {
        const response = await fetch('/api/roles/deletion-requests', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch deletion requests');
        
        const data = await response.json();
        setDeletionRequests(data);
      } catch (error) {
        console.error('Error fetching deletion requests:', error);
        // Create mock data if API fails
        setDeletionRequests([
          {
            id: 1,
            requesterId: 3,
            targetUserId: 15,
            reason: 'Multiple violations of platform guidelines',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            requester: {
              id: 3,
              username: 'admin1',
              fullName: 'Admin User',
              role: 'admin'
            },
            targetUser: {
              id: 15,
              username: 'user15',
              fullName: 'Problem User',
              role: 'user'
            }
          }
        ]);
      }
    };
    
    fetchDeletionRequests();
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
  
  // Handle creating a new user (admin/moderator)
  const handleCreateUser = async () => {
    try {
      setIsCreatingUser(true);
      
      // Validate form
      if (!newUserData.username || !newUserData.email || !newUserData.password) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await fetch('/api/roles/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(newUserData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      const createdUser = await response.json();
      
      // Update users list
      setUsers(prevUsers => [...prevUsers, createdUser]);
      
      toast({
        title: 'Success',
        description: `${createdUser.role} account created successfully`,
      });
      
      // Reset form and close modal
      setNewUserData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        bloodType: 'O+',
        role: 'admin',
      });
      setShowCreateUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };
  
  // Handle changing a user's role
  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch('/api/roles/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ userId, newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change role');
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
        description: `User role changed to ${newRole}`,
      });
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle suspending a user
  const handleSuspendUser = async (userId) => {
    try {
      const response = await fetch('/api/roles/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ 
          userId, 
          status: 'suspended',
          reason: 'Account suspended by administrator',
          suspensionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to suspend user');
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
        description: 'User suspended for 30 days',
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
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
          suspensionEndDate: status === 'suspended' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
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
  
  // Handle directly deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      setIsDeleting(true);
      
      // For superadmins, use the direct delete endpoint
      if (user.role === 'superadmin') {
        const response = await fetch(`/api/roles/user/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }
      } else {
        // For admins, create a deletion request
        const response = await fetch('/api/roles/request-deletion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify({ 
            userId, 
            reason: 'Account deletion requested by admin'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to request user deletion');
        }
      }
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      toast({
        title: 'Success',
        description: user.role === 'superadmin' 
          ? 'User deleted successfully' 
          : 'Deletion request submitted for approval',
      });
      
      // Close the modal
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle approving/denying deletion requests
  const handleDeletionRequest = async (requestId, approve) => {
    try {
      const response = await fetch('/api/roles/handle-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ requestId, approve })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to handle deletion request');
      }
      
      // Update deletion requests list
      setDeletionRequests(prevRequests => 
        prevRequests.filter(req => req.id !== requestId)
      );
      
      // If approved, also remove user from users list
      if (approve) {
        const request = deletionRequests.find(req => req.id === requestId);
        if (request) {
          setUsers(prevUsers => 
            prevUsers.filter(u => u.id !== request.targetUserId)
          );
        }
      }
      
      toast({
        title: 'Success',
        description: approve ? 'User deleted successfully' : 'Deletion request rejected',
      });
    } catch (error) {
      console.error('Error handling deletion request:', error);
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
          row.original.role === 'superadmin' ? 'bg-purple-600' :
          row.original.role === 'admin' ? 'bg-red-600' :
          row.original.role === 'moderator' ? 'bg-amber-600' :
          row.original.role === 'volunteer' ? 'bg-emerald-600' :
          'bg-blue-600'
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
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? new Date(date).toLocaleDateString() : 'Unknown';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const userData = row.original;
        
        // Can't modify superadmin or yourself
        if (userData.role === 'superadmin' || userData.id === user.id) {
          return <span className="text-gray-400">{userData.id === user.id ? 'Current user' : 'No actions'}</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            {/* Change Role Select */}
            <Select
              onValueChange={(value) => handleChangeRole(userData.id, value)}
              defaultValue={userData.role}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="donor">Donor</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Ban/Activate buttons */}
            {userData.status === 'banned' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(userData.id, 'active')}
                title="Activate"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserCog className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUpdateStatus(userData.id, 'banned')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      <span>Ban User</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSuspendUser(userData.id)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>Suspend (30 days)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Delete button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setUserToDelete(userData);
                setShowDeleteConfirmModal(true);
              }}
              title="Delete User"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Define columns for the deletion requests table
  const deletionRequestColumns = [
    {
      accessorKey: 'requester.username',
      header: 'Requested By',
    },
    {
      accessorKey: 'targetUser.username',
      header: 'User to Delete',
    },
    {
      accessorKey: 'targetUser.role',
      header: 'User Role',
      cell: ({ row }) => (
        <Badge className={
          row.original.targetUser.role === 'admin' ? 'bg-red-600' :
          row.original.targetUser.role === 'moderator' ? 'bg-amber-600' :
          row.original.targetUser.role === 'volunteer' ? 'bg-emerald-600' :
          'bg-blue-600'
        }>
          {row.original.targetUser.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'createdAt',
      header: 'Requested On',
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletionRequest(row.original.id, true)}
            title="Approve"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeletionRequest(row.original.id, false)}
            title="Reject"
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Render delete confirmation modal
  const renderDeleteConfirmModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDeleteConfirmModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Confirm User Deletion</h2>
        
        {userToDelete && (
          <div className="space-y-4">
            <p className="text-red-600 font-semibold">
              This action cannot be undone. Are you sure you want to delete this user?
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <p><span className="font-semibold">Username:</span> {userToDelete.username}</p>
              <p><span className="font-semibold">Email:</span> {userToDelete.email}</p>
              <p><span className="font-semibold">Role:</span> {userToDelete.role}</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(userToDelete.id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render create user modal
  const renderCreateUserModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCreateUserModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Create Staff Account</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username*</label>
            <Input
              value={newUserData.username}
              onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email*</label>
            <Input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password*</label>
            <Input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              value={newUserData.fullName}
              onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Blood Type*</label>
            <Select
              value={newUserData.bloodType}
              onValueChange={(value) => setNewUserData({ ...newUserData, bloodType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Role*</label>
            <Select
              value={newUserData.role}
              onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {user.role === 'superadmin' && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {newUserData.role === 'admin' && "Admins can manage all users and content"}
              {newUserData.role === 'moderator' && "Moderators can verify users and moderate content"}
              {newUserData.role === 'volunteer' && "Volunteers can assist with donor coordination"}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowCreateUserModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            disabled={isCreatingUser}
          >
            {isCreatingUser ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold">{systemStats.totalUsers}</h3>
                <p className="text-xs text-green-600">+{systemStats.newUsersThisMonth} this month</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-2 mr-4">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Requests</p>
                <h3 className="text-2xl font-bold">{systemStats.activeRequests}</h3>
                <p className="text-xs">Requiring attention</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 mr-4">
                <BarChart4 className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Donations</p>
                <h3 className="text-2xl font-bold">{systemStats.totalDonations}</h3>
                <p className="text-xs">Blood donations tracked</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2 mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Verifications</p>
                <h3 className="text-2xl font-bold">{systemStats.pendingVerifications}</h3>
                <p className="text-xs">Awaiting approval</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="deletion-requests" className="flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" />
              <span>Deletion Requests</span>
              {deletionRequests.length > 0 && (
                <span className="ml-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {deletionRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bloodbanks" className="flex items-center gap-1.5">
              <Building className="h-4 w-4" />
              <span>Blood Banks</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all users in the system</CardDescription>
                  </div>
                  
                  <Button onClick={() => setShowCreateUserModal(true)} className="flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Staff</span>
                  </Button>
                </div>
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
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
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
          
          <TabsContent value="deletion-requests">
            <Card>
              <CardHeader>
                <CardTitle>User Deletion Requests</CardTitle>
                <CardDescription>Review and approve deletion requests from administrators</CardDescription>
              </CardHeader>
              
              <CardContent>
                {deletionRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending deletion requests
                  </div>
                ) : (
                  <DataTable
                    columns={deletionRequestColumns}
                    data={deletionRequests}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bloodbanks">
            <Card>
              <CardHeader>
                <CardTitle>Blood Bank Management</CardTitle>
                <CardDescription>Manage blood banks and inventory</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Manage blood bank locations and their inventory levels. Blood banks will be visible on the public map.
                  </p>
                  
                  <div className="flex flex-col gap-4 md:flex-row">
                    <a href="/bloodbanks" className="w-full">
                      <Card className="h-full hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center py-6">
                          <Building className="h-10 w-10 mb-2 text-red-600" />
                          <h3 className="font-semibold text-lg">Manage Blood Banks</h3>
                          <p className="text-sm text-center mt-2">
                            Add, edit, or remove blood bank locations and update their inventory
                          </p>
                        </CardContent>
                      </Card>
                    </a>
                    
                    <a href="/bloodbank-map" className="w-full">
                      <Card className="h-full hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center py-6">
                          <MapPin className="h-10 w-10 mb-2 text-blue-600" />
                          <h3 className="font-semibold text-lg">View Blood Bank Map</h3>
                          <p className="text-sm text-center mt-2">
                            See all blood banks on an interactive map
                          </p>
                        </CardContent>
                      </Card>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">User Registration</h3>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Allow Public Registration</p>
                        <p className="text-sm text-gray-500">When enabled, anyone can register as a donor or user</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Moderation Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Require Document Verification</p>
                          <p className="text-sm text-gray-500">New donors must verify identity with documents</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Auto-approve Volunteer Accounts</p>
                          <p className="text-sm text-gray-500">Volunteers can start working without admin approval</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Security Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Require 2FA for all admin and moderator accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Account Lockout</p>
                          <p className="text-sm text-gray-500">Lock accounts after 5 failed login attempts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {renderCreateUserModal()}
      {renderDeleteConfirmModal()}
    </>
  );
};

export default SuperAdminDashboard;