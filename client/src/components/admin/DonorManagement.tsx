import React, { useState, useEffect } from 'react';
import { dbService, UserSchema, DonorProfileSchema } from '@/lib/firebase/database';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  User, 
  CheckCircle, 
  XCircle, 
  Droplet,
  Award,
  Calendar,
  MapPin
} from 'lucide-react';

interface DonorWithProfile extends UserSchema {
  profile?: DonorProfileSchema;
}

const DonorManagement = () => {
  const [donors, setDonors] = useState<DonorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState<DonorWithProfile | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [formData, setFormData] = useState({
    verificationStatus: 'Pending',
    verificationNotes: '',
    badge: 'Bronze',
  });

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    setLoading(true);
    try {
      // Load all users who are donors
      const users = await dbService.getAll<UserSchema>('users');
      const donorUsers = users.filter(user => user.role === 'donor');
      
      // Load all donor profiles
      const profiles = await dbService.getAll<DonorProfileSchema>('donorProfiles');
      
      // Create a map of profiles by user ID for quick lookup
      const profileMap = profiles.reduce((map, profile) => {
        map[profile.userId] = profile;
        return map;
      }, {} as Record<string, DonorProfileSchema>);
      
      // Combine donors with their profile data
      const enhancedDonors = donorUsers.map(donor => ({
        ...donor,
        profile: profileMap[donor.id]
      }));
      
      setDonors(enhancedDonors);
    } catch (error) {
      console.error('Error loading donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleViewDonor = (donor: DonorWithProfile) => {
    setSelectedDonor(donor);
    setIsViewOpen(true);
  };

  const handleVerifyDonor = (donor: DonorWithProfile) => {
    setSelectedDonor(donor);
    
    if (donor.profile) {
      setFormData({
        verificationStatus: donor.profile.verificationStatus,
        verificationNotes: donor.profile.verificationNotes || '',
        badge: donor.profile.badge || 'Bronze'
      });
    } else {
      setFormData({
        verificationStatus: 'Pending',
        verificationNotes: '',
        badge: 'Bronze'
      });
    }
    
    setIsVerifyOpen(true);
  };

  const handleSaveVerification = async () => {
    if (!selectedDonor || !selectedDonor.profile) return;
    
    setLoading(true);
    try {
      await dbService.update<DonorProfileSchema>('donorProfiles', selectedDonor.profile.id, {
        verificationStatus: formData.verificationStatus as any,
        verificationNotes: formData.verificationNotes,
        badge: formData.badge as any,
        verifiedAt: formData.verificationStatus === 'Verified' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for the donor
      await dbService.createNotification({
        userId: selectedDonor.id,
        title: 'Verification Status Updated',
        message: `Your donor verification status has been updated to: ${formData.verificationStatus}`,
        type: 'DonorVerification',
        read: false,
        relatedEntityId: selectedDonor.profile.id,
        relatedEntityType: 'DonorProfile'
      });
      
      setIsVerifyOpen(false);
      loadDonors();
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Failed to update verification status: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.username.toLowerCase().includes(search.toLowerCase()) ||
      donor.email.toLowerCase().includes(search.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'verified') return matchesSearch && donor.profile?.verificationStatus === 'Verified';
    if (activeTab === 'pending') return matchesSearch && donor.profile?.verificationStatus === 'Pending';
    if (activeTab === 'rejected') return matchesSearch && donor.profile?.verificationStatus === 'Rejected';
    if (activeTab === 'available') return matchesSearch && donor.profile?.status === 'Available';
    if (activeTab === 'unavailable') return matchesSearch && donor.profile?.status === 'Unavailable';
    
    return matchesSearch;
  });

  // Function to get verification badge variant
  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Unavailable':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Function to get badge badge variant (gold, silver, bronze)
  const getBadgeBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'Gold':
        return 'default';
      case 'Silver':
        return 'secondary';
      case 'Bronze':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Count donors by verification status
  const countsByVerification = donors.reduce((acc, donor) => {
    const status = donor.profile?.verificationStatus || 'Unknown';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {} as Record<string, number>);

  // Count donors by blood type
  const countsByBloodType = donors.reduce((acc, donor) => {
    if (!acc[donor.bloodType]) {
      acc[donor.bloodType] = 0;
    }
    acc[donor.bloodType]++;
    return acc;
  }, {} as Record<string, number>);

  // Count donors by availability status
  const countsByStatus = donors.reduce((acc, donor) => {
    const status = donor.profile?.status || 'Unknown';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Donor Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search donors..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadDonors}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Total Donors</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{donors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="flex justify-between">
                <span>Verified:</span>
                <span>{countsByVerification['Verified'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span>{countsByVerification['Pending'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Rejected:</span>
                <span>{countsByVerification['Rejected'] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Availability</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="flex justify-between">
                <span>Available:</span>
                <span>{countsByStatus['Available'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Unavailable:</span>
                <span>{countsByStatus['Unavailable'] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Blood Types</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              {Object.entries(countsByBloodType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
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
                <TableHead>Blood Type</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No donors found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium">{donor.username}</TableCell>
                    <TableCell>{donor.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{donor.bloodType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getVerificationBadgeVariant(donor.profile?.verificationStatus || 'Unknown')}>
                        {donor.profile?.verificationStatus || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(donor.profile?.status || 'Unknown')}>
                        {donor.profile?.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeBadgeVariant(donor.profile?.badge || 'Bronze')}>
                        <Award className="h-3 w-3 mr-1" />
                        {donor.profile?.badge || 'Bronze'}
                      </Badge>
                    </TableCell>
                    <TableCell>{donor.profile?.totalDonations || 0}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDonor(donor)}>
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerifyDonor(donor)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Donor
                          </DropdownMenuItem>
                          {donor.profile?.location?.latitude && donor.profile?.location?.longitude && (
                            <DropdownMenuItem 
                              onClick={() => {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${donor.profile?.location.latitude},${donor.profile?.location.longitude}`, '_blank');
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              View on Map
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              window.open(`/donors/${donor.id}`, '_blank');
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Full Profile
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

      {/* View Donor Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Donor Profile</DialogTitle>
            <DialogDescription>
              Complete information about this blood donor.
            </DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">Personal Information</h3>
                  <p className="text-lg font-semibold">{selectedDonor.username}</p>
                  <p className="text-sm">{selectedDonor.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="flex items-center">
                      <Droplet className="h-3 w-3 mr-1 text-red-500" />
                      {selectedDonor.bloodType}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Account Details</h3>
                  <p className="text-sm">Joined: {new Date(selectedDonor.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm">Last Login: {selectedDonor.lastLogin ? new Date(selectedDonor.lastLogin).toLocaleDateString() : 'Never'}</p>
                </div>
                
                {selectedDonor.profile?.contactPhone && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Contact Information</h3>
                    <p className="text-sm">{selectedDonor.profile.contactPhone}</p>
                    {selectedDonor.profile.address && (
                      <p className="text-sm">
                        {selectedDonor.profile.address}, {selectedDonor.profile.city}, {selectedDonor.profile.state}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">Donor Status</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedDonor.profile?.status || 'Unknown')}>
                      {selectedDonor.profile?.status || 'Unknown'}
                    </Badge>
                    <Badge variant={getVerificationBadgeVariant(selectedDonor.profile?.verificationStatus || 'Unknown')}>
                      {selectedDonor.profile?.verificationStatus || 'Unknown'}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Donation History</h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Donations:</span>
                      <span className="font-medium">{selectedDonor.profile?.totalDonations || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Blood Volume:</span>
                      <span className="font-medium">{selectedDonor.profile?.litersDonated ? `${selectedDonor.profile.litersDonated} mL` : '0 mL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lives Saved:</span>
                      <span className="font-medium">{selectedDonor.profile?.livesSaved || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Badge Level:</span>
                      <Badge variant={getBadgeBadgeVariant(selectedDonor.profile?.badge || 'Bronze')} className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {selectedDonor.profile?.badge || 'Bronze'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedDonor.profile?.lastDonationDate && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Last Donation</h3>
                    <p className="text-sm">{new Date(selectedDonor.profile.lastDonationDate).toLocaleDateString()}</p>
                    {selectedDonor.profile?.nextEligibleDate && (
                      <p className="text-sm">
                        Next Eligible: {new Date(selectedDonor.profile.nextEligibleDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                
                {selectedDonor.profile?.verificationNotes && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Verification Notes</h3>
                    <p className="text-sm whitespace-pre-line">{selectedDonor.profile.verificationNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button variant="default" onClick={() => {
              setIsViewOpen(false);
              handleVerifyDonor(selectedDonor as DonorWithProfile);
            }}>
              Update Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Donor Dialog */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Donor</DialogTitle>
            <DialogDescription>
              Update verification status and badge for this donor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <Select 
                value={formData.verificationStatus} 
                onValueChange={(value) => handleSelectChange('verificationStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="badge">Badge</Label>
              <Select 
                value={formData.badge} 
                onValueChange={(value) => handleSelectChange('badge', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Bronze: 0-9 donations | Silver: 10-24 donations | Gold: 25+ donations
              </p>
            </div>
            
            <div>
              <Label htmlFor="verificationNotes">Notes</Label>
              <Textarea
                id="verificationNotes"
                name="verificationNotes"
                value={formData.verificationNotes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter any notes about this verification"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVerification} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonorManagement;
