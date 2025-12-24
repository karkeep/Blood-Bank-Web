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
  UserPlus, 
  UserCog, 
  ShieldAlert, 
  Users, 
  Ban, 
  Calendar, 
  Search, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';

const UserManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    bloodType: 'O+',
    role: 'volunteer',
  });
  
  // Check if user is superadmin
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  
  // Fetch users based on user's role
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
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
  
  // Fetch deletion requests (for superadmins)
  useEffect(() => {
    if (!user || !isSuperAdmin) return;
    
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
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    };
    
    fetchDeletionRequests();
  }, [user, isSuperAdmin, toast]);
  
  // Filter users based on search query and role filter
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.fullName?.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter]);
  
  // Handle creating a new user
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
        role: 'volunteer',
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
  
  // Handle requesting user deletion (for admins)
  const handleRequestDeletion = async (userId) => {
    try {
      const reason = prompt('Please provide a reason for requesting deletion:');
      if (!reason) return; // Cancelled
      
      const response = await fetch('/api/roles/request-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ userId, reason })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request deletion');
      }
      
      toast({
        title: 'Success',
        description: 'Deletion request submitted for approval',
      });
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle approving/denying deletion requests (for superadmins)
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const userData = row.original;
        
        // Admins can't modify superadmins
        if (userData.role === 'superadmin' && !isSuperAdmin) {
          return <span className="text-gray-400">No actions</span>;
        }
        
        // Current user can't modify themselves
        if (userData.id === user.id) {
          return <span className="text-gray-400">Current user</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            {/* Change Role button (only for admins/superadmins) */}
            {isAdmin && (
              <Select
                disabled={!isAdmin}
                onValueChange={(value) => handleChangeRole(userData.id, value)}
                defaultValue={userData.role}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {/* Ban/Suspend/Activate buttons */}
            {userData.status === 'active' || !userData.status ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(userData.id, 'suspended')}
                  title="Suspend"
                >
                  <Calendar className="h-3.5 w-3.5" />
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
            
            {/* Delete/Request Deletion button */}
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => isSuperAdmin 
                  ? handleUpdateStatus(userData.id, 'banned') // Superadmins ban users directly
                  : handleRequestDeletion(userData.id) // Admins request deletion
                }
                title={isSuperAdmin ? "Ban User" : "Request Deletion"}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
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
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeletionRequest(row.original.id, false)}
            title="Reject"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Render create user modal
  const renderCreateUserModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCreateUserModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Create New User</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input
              value={newUserData.username}
              onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
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
            <label className="block text-sm font-medium mb-1">Blood Type</label>
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
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={newUserData.role}
              onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="donor">Donor</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
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
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="deletion-requests" className="flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" />
                <span>Deletion Requests</span>
                {deletionRequests.length > 0 && (
                  <span className="ml-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {deletionRequests.length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage all users in the system</CardDescription>
                  </div>
                  
                  {isAdmin && (
                    <Button onClick={() => setShowCreateUserModal(true)} className="flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      <span>Create User</span>
                    </Button>
                  )}
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
                      {isSuperAdmin && <SelectItem value="superadmin">Super Admin</SelectItem>}
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
          
          {isSuperAdmin && (
            <TabsContent value="deletion-requests">
              <Card>
                <CardHeader>
                  <CardTitle>Deletion Requests</CardTitle>
                  <CardDescription>Manage account deletion requests from admins</CardDescription>
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
          )}
        </Tabs>
      </div>
      
      {renderCreateUserModal()}
    </>
  );
};

export default UserManagement;