import React, { useState, useEffect } from 'react';
import { dbService, EmergencyRequestSchema, UserSchema } from '@/lib/firebase/database';
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
import { Loader2, MoreHorizontal, Search, Eye, CheckCircle, XCircle, MapPin } from 'lucide-react';

interface EmergencyRequestWithUser extends EmergencyRequestSchema {
  requester?: UserSchema;
}

const EmergencyRequests = () => {
  const [requests, setRequests] = useState<EmergencyRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequestWithUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: 'Pending',
    notes: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Load all emergency requests
      const emergencyRequests = await dbService.getAll<EmergencyRequestSchema>('emergencyRequests');
      
      // Load all users
      const users = await dbService.getAll<UserSchema>('users');
      
      // Create a map of users by ID for quick lookup
      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {} as Record<string, UserSchema>);
      
      // Combine emergency requests with requester data
      const enhancedRequests = emergencyRequests.map(request => ({
        ...request,
        requester: userMap[request.requesterId]
      }));
      
      setRequests(enhancedRequests);
    } catch (error) {
      console.error('Error loading emergency requests:', error);
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

  const handleViewRequest = (request: EmergencyRequestWithUser) => {
    setSelectedRequest(request);
    setIsViewOpen(true);
  };

  const handleUpdateRequest = (request: EmergencyRequestWithUser) => {
    setSelectedRequest(request);
    setFormData({
      status: request.status,
      notes: request.notes || ''
    });
    setIsUpdateOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await dbService.update<EmergencyRequestSchema>('emergencyRequests', selectedRequest.id, {
        status: formData.status as any,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      });
      
      // Create notification for the requester
      if (selectedRequest.requesterId) {
        await dbService.createNotification({
          userId: selectedRequest.requesterId,
          title: 'Emergency Request Updated',
          message: `Your emergency request for ${selectedRequest.patientName} has been updated to status: ${formData.status}`,
          type: 'EmergencyRequest',
          read: false,
          relatedEntityId: selectedRequest.id,
          relatedEntityType: 'EmergencyRequest'
        });
      }
      
      setIsUpdateOpen(false);
      loadRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.patientName.toLowerCase().includes(search.toLowerCase()) ||
      request.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      request.bloodType.toLowerCase().includes(search.toLowerCase()) ||
      request.requester?.username?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && request.status === 'Pending';
    if (activeTab === 'matching') return matchesSearch && request.status === 'Matching';
    if (activeTab === 'fulfilled') return matchesSearch && request.status === 'Fulfilled';
    if (activeTab === 'cancelled') return matchesSearch && request.status === 'Cancelled';
    if (activeTab === 'expired') return matchesSearch && request.status === 'Expired';
    
    return matchesSearch;
  });

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Matching':
        return 'default';
      case 'Fulfilled':
        return 'success';
      case 'Cancelled':
        return 'destructive';
      case 'Expired':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Function to get urgency badge variant
  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'destructive';
      case 'Urgent':
        return 'default';
      case 'Normal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Count requests by status
  const countsByStatus = requests.reduce((acc, request) => {
    if (!acc[request.status]) {
      acc[request.status] = 0;
    }
    acc[request.status]++;
    return acc;
  }, {} as Record<string, number>);

  // Count requests by blood type
  const countsByBloodType = requests.reduce((acc, request) => {
    if (!acc[request.bloodType]) {
      acc[request.bloodType] = 0;
    }
    acc[request.bloodType]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Emergency Requests</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadRequests}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">All Requests</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Pending/Matching</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">
              {(countsByStatus['Pending'] || 0) + (countsByStatus['Matching'] || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Fulfilled</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{countsByStatus['Fulfilled'] || 0}</div>
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
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
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
                <TableHead>Patient</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No emergency requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.patientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.bloodType}</Badge>
                    </TableCell>
                    <TableCell>{request.unitsNeeded} units</TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyBadgeVariant(request.urgency)}>
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.hospitalName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRequest(request)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              window.open(`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`, '_blank');
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
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

      {/* View Request Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Emergency Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this blood donation request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">Patient Information</h3>
                  <p className="text-lg font-semibold">{selectedRequest.patientName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{selectedRequest.bloodType}</Badge>
                    <span>{selectedRequest.unitsNeeded} units needed</span>
                  </div>
                  {selectedRequest.requestReason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {selectedRequest.requestReason}
                    </p>
                  )}
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Requester</h3>
                  <p>{selectedRequest.requester?.username || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.requester?.email || 'No email'}
                  </p>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Contact Information</h3>
                  <p>{selectedRequest.contactName} ({selectedRequest.contactRelation})</p>
                  <p className="text-sm">{selectedRequest.contactPhone}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm">Hospital Information</h3>
                  <p className="font-semibold">{selectedRequest.hospitalName}</p>
                  <p className="text-sm">
                    {selectedRequest.hospitalAddress}, {selectedRequest.hospitalCity}, {selectedRequest.hospitalState}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${selectedRequest.latitude},${selectedRequest.longitude}`, '_blank');
                  }}>
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </div>
                
                <div className="pt-2">
                  <h3 className="font-medium text-sm">Request Status</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                    <Badge variant={getUrgencyBadgeVariant(selectedRequest.urgency)}>
                      {selectedRequest.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(selectedRequest.expiresAt).toLocaleString()}
                  </p>
                </div>
                
                {selectedRequest.notes && (
                  <div className="pt-2">
                    <h3 className="font-medium text-sm">Notes</h3>
                    <p className="text-sm whitespace-pre-line">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button variant="default" onClick={() => {
              setIsViewOpen(false);
              handleUpdateRequest(selectedRequest as EmergencyRequestWithUser);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Change the status of this emergency blood request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Matching">Matching</SelectItem>
                  <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter any notes about this status change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyRequests;
