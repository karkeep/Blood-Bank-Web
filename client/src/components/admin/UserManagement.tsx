import React, { useState, useEffect } from 'react';
import { dbService, UserSchema } from '@/lib/firebase/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  ShieldAlert, 
  Ban, 
  User,
  UserCheck,
  Lock,
  Unlock,
  Mail,
  ShieldCheck
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserSchema | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: 'user',
    isAdmin: false,
    isActive: true,
    bloodType: 'O+',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load all users
      const allUsers = await dbService.getAll<UserSchema>('users');
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckedChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleViewUser = (user: UserSchema) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEditUser = (user: UserSchema) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || 'user',
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== false, // Default to true if undefined
      bloodType: user.bloodType || 'O+',
    });
    setIsEditOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await dbService.update<UserSchema>('users', selectedUser.id, {
        role: formData.role,
        isAdmin: formData.isAdmin,
        isActive: formData.isActive,
        bloodType: formData.bloodType,
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for the user
      await dbService.createNotification({
        userId: selectedUser.id,
        title: 'Account Updated',
        message: 'Your account details have been updated by an administrator.',
        type: 'AccountUpdate',
        read: false,
      });
      
      setIsEditOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, makeActive: boolean) => {
    setLoading(true);
    try {
      await dbService.update<UserSchema>('users', userId, {
        isActive: makeActive,
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for the user
      await dbService.createNotification({
        userId,
        title: makeActive ? 'Account Activated' : 'Account Deactivated',
        message: makeActive 
          ? 'Your account has been activated by an administrator.' 
          : 'Your account has been deactivated by an administrator.',
        type: 'AccountStatus',
        read: false,
      });
      
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setLoading(true);
    try {
      await dbService.update<UserSchema>('users', userId, {
        isAdmin: makeAdmin,
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for the user
      await dbService.createNotification({
        userId,
        title: makeAdmin ? 'Admin Access Granted' : 'Admin Access Removed',
        message: makeAdmin 
          ? 'You have been granted administrator privileges.' 
          : 'Your administrator privileges have been removed.',
        type: 'AdminStatus',
        read: false,
      });
      
      loadUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      ((user.role?.toLowerCase() || '')).includes(search.toLowerCase()) ||
      ((user.bloodType?.toLowerCase() || '')).includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'admin') return matchesSearch && (user.isAdmin === true);
    if (activeTab === 'donors') return matchesSearch && (user.role === 'donor');
    if (activeTab === 'requesters') return matchesSearch && (user.role === 'requester');
    if (activeTab === 'inactive') return matchesSearch && (user.isActive === false);
    
    return matchesSearch;
  });

  // Count users by role
  const countsByRole = users.reduce((acc, user) => {
    const role = user.role || 'user';
    if (!acc[role]) {
      acc[role] = 0;
    }
    acc[role]++;
    return acc;
  }, {} as Record<string, number>);

  // Count admins
  const adminCount = users.filter(user => user.isAdmin === true).length;
  
  // Count active vs inactive
  const activeCount = users.filter(user => user.isActive !== false).length;
  const inactiveCount = users.filter(user => user.isActive === false).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadUsers}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">
              {activeCount} active, {inactiveCount} inactive
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">User Roles</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="flex justify-between">
                <span>Donors:</span>
                <span>{countsByRole['donor'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Requesters:</span>
                <span>{countsByRole['requester'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Regular:</span>
                <span>{countsByRole['user'] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Administrators</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">New Users (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">
              {users.filter(user => {
                const createdAt = new Date(user.createdAt);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdAt >= thirtyDaysAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Administrators</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="requesters">Requesters</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'donor' ? 'default' : 
                        user.role === 'requester' ? 'secondary' : 
                        'outline'
                      }>
                        {user.role || 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.bloodType && (
                        <Badge variant="outline">{user.bloodType}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive === false ? 'destructive' : 'success'} className="capitalize">
                        {user.isActive === false ? 'Inactive' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin && (
                        <Badge variant="default" className="bg-violet-100 text-violet-800 border-violet-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <User className="h-4 w-4 mr-2" />
                            View User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {user.isActive === false ? (
                            <DropdownMenuItem onClick={() => handleToggleActive(user.id, true)}>
                              <Unlock className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleActive(user.id, false)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Deactivate User
                            </DropdownMenuItem>
                          )}
                          {user.isAdmin ? (
                            <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, false)}>
                              <Ban className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, true)}>
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${user.email}`}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email User
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">User Information</h3>
                  <p className="text-lg font-semibold">{selectedUser.username}</p>
                  <p className="text-sm">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={
                      selectedUser.role === 'donor' ? 'default' : 
                      selectedUser.role === 'requester' ? 'secondary' : 
                      'outline'
                    }>
                      {selectedUser.role || 'User'}
                    </Badge>
                    {selectedUser.isAdmin && (
                      <Badge variant="default" className="bg-violet-100 text-violet-800 border-violet-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge variant={selectedUser.isActive === false ? 'destructive' : 'success'} className="capitalize">
                      {selectedUser.isActive === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Account Details</h3>
                  <p className="text-sm">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm">Last Updated: {new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                  {selectedUser.lastLogin && (
                    <p className="text-sm">Last Login: {new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">Personal Details</h3>
                  {selectedUser.fullName && (
                    <p className="text-sm">Full Name: {selectedUser.fullName}</p>
                  )}
                  {selectedUser.bloodType && (
                    <p className="text-sm">Blood Type: {selectedUser.bloodType}</p>
                  )}
                  {selectedUser.phoneNumber && (
                    <p className="text-sm">Phone: {selectedUser.phoneNumber}</p>
                  )}
                </div>
                
                {selectedUser.address && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Address</h3>
                    <p className="text-sm whitespace-pre-line">
                      {selectedUser.address}
                      {selectedUser.city && `, ${selectedUser.city}`}
                      {selectedUser.state && `, ${selectedUser.state}`}
                      {selectedUser.postalCode && ` ${selectedUser.postalCode}`}
                      {selectedUser.country && `, ${selectedUser.country}`}
                    </p>
                  </div>
                )}
                
                {selectedUser.notes && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Additional Notes</h3>
                    <p className="text-sm whitespace-pre-line">{selectedUser.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button variant="default" onClick={() => {
              setIsViewOpen(false);
              handleEditUser(selectedUser as UserSchema);
            }}>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="role">User Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Regular User</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="requester">Requester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select 
                value={formData.bloodType} 
                onValueChange={(value) => handleSelectChange('bloodType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => handleCheckedChange('isAdmin', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isAdmin" className="cursor-pointer">Administrator Privileges</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleCheckedChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Account Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
