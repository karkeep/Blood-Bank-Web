import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Users,
  Bell,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Droplet,
  CalendarClock
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [donationEvents, setDonationEvents] = useState([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [selectedDonors, setSelectedDonors] = useState([]);
  
  const [newEventData, setNewEventData] = useState({
    title: '',
    location: '',
    address: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    organizerName: user?.fullName || '',
    organizerContact: '',
    maxCapacity: 50,
  });
  
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    bloodTypes: [],
    maxDistance: 10, // km
    includeOnlyEligible: true,
  });
  
  // Fetch users (donors)
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch only donor users that volunteers are allowed to see
        const response = await fetch('/api/roles/users?role=donor', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch donors');
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching donors:', error);
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
  
  // Fetch donation events
  useEffect(() => {
    if (!user) return;
    
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // This endpoint would need to be implemented on the server
        const response = await fetch('/api/donation-events', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch donation events');
        
        const data = await response.json();
        setDonationEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        // For development, create mock events if API fails
        const mockEvents = [
          {
            id: 1,
            title: 'Blood Donation Camp',
            location: 'City Hospital',
            address: '123 Main St, Kathmandu',
            date: '2025-06-01',
            startTime: '09:00',
            endTime: '17:00',
            description: 'Regular blood donation camp organized by City Hospital.',
            organizerName: 'Dr. Sharma',
            organizerContact: '+977 9841234567',
            maxCapacity: 50,
            currentRegistrations: 12,
            createdBy: 'volunteer1',
          },
          {
            id: 2,
            title: 'Emergency Blood Drive',
            location: 'Community Center',
            address: '45 Park Road, Pokhara',
            date: '2025-05-28',
            startTime: '10:00',
            endTime: '16:00',
            description: 'Urgent blood drive to address shortage of O- blood type.',
            organizerName: 'Red Cross Nepal',
            organizerContact: '+977 9851234567',
            maxCapacity: 30,
            currentRegistrations: 8,
            createdBy: 'volunteer2',
          }
        ];
        setDonationEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user, toast]);
  
  // Filter users based on search query and blood type filter
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
    
    // Apply blood type filter
    if (bloodTypeFilter !== 'all') {
      result = result.filter(user => user.bloodType === bloodTypeFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, bloodTypeFilter]);
  
  // Handle creating a new donation event
  const handleCreateEvent = async () => {
    try {
      setIsCreatingEvent(true);
      
      // Validate form
      if (!newEventData.title || !newEventData.location || !newEventData.date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      // This endpoint would need to be implemented on the server
      const response = await fetch('/api/donation-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          ...newEventData,
          createdBy: user.id,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      // For development, mock the response
      const createdEvent = {
        id: donationEvents.length + 1,
        ...newEventData,
        currentRegistrations: 0,
        createdBy: user.id,
      };
      
      // Update events list
      setDonationEvents(prevEvents => [...prevEvents, createdEvent]);
      
      toast({
        title: 'Success',
        description: 'Blood donation event created successfully',
      });
      
      // Reset form and close modal
      setNewEventData({
        title: '',
        location: '',
        address: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        organizerName: user?.fullName || '',
        organizerContact: '',
        maxCapacity: 50,
      });
      setShowCreateEventModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };
  
  // Handle sending notifications to donors
  const handleSendNotification = async () => {
    try {
      setIsSendingNotification(true);
      
      // Validate form
      if (!notificationData.title || !notificationData.message) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      // This endpoint would need to be implemented on the server
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          ...notificationData,
          recipientIds: selectedDonors.length > 0 
            ? selectedDonors.map(donor => donor.id)
            : undefined, // If no specific donors selected, server will use filters
          sentBy: user.id,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }
      
      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      });
      
      // Reset form and close modal
      setNotificationData({
        title: '',
        message: '',
        bloodTypes: [],
        maxDistance: 10,
        includeOnlyEligible: true,
      });
      setSelectedDonors([]);
      setShowSendNotificationModal(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingNotification(false);
    }
  };
  
  // Toggle donor selection for notifications
  const toggleDonorSelection = (donor) => {
    setSelectedDonors(prevSelected => {
      const isSelected = prevSelected.some(d => d.id === donor.id);
      if (isSelected) {
        return prevSelected.filter(d => d.id !== donor.id);
      } else {
        return [...prevSelected, donor];
      }
    });
  };
  
  // Define columns for the users (donors) table
  const donorColumns = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={
            selectedDonors.length > 0 &&
            filteredUsers.every(user =>
              selectedDonors.some(selected => selected.id === user.id)
            )
          }
          onChange={() => {
            if (
              selectedDonors.length > 0 &&
              filteredUsers.every(user =>
                selectedDonors.some(selected => selected.id === user.id)
              )
            ) {
              setSelectedDonors([]);
            } else {
              setSelectedDonors(filteredUsers);
            }
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedDonors.some(donor => donor.id === row.original.id)}
          onChange={() => toggleDonorSelection(row.original)}
        />
      ),
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
      accessorKey: 'bloodType',
      header: 'Blood Type',
      cell: ({ row }) => (
        <Badge className="bg-red-600">{row.original.bloodType}</Badge>
      ),
    },
    {
      accessorKey: 'donorProfile.status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.donorProfile?.status || 'Pending';
        return (
          <Badge className={
            status === 'Available' ? 'bg-green-600' :
            status === 'Unavailable' ? 'bg-red-600' :
            'bg-amber-600'
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'donorProfile.lastDonationDate',
      header: 'Last Donation',
      cell: ({ row }) => {
        const date = row.original.donorProfile?.lastDonationDate;
        return date ? new Date(date).toLocaleDateString() : 'Never';
      },
    },
    {
      accessorKey: 'donorProfile.nextEligibleDate',
      header: 'Next Eligible',
      cell: ({ row }) => {
        const date = row.original.donorProfile?.nextEligibleDate;
        return date ? new Date(date).toLocaleDateString() : 'Eligible Now';
      },
    },
    {
      accessorKey: 'donorProfile.totalDonations',
      header: 'Donations',
      cell: ({ row }) => row.original.donorProfile?.totalDonations || 0,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotificationData(prev => ({
                ...prev,
                bloodTypes: [row.original.bloodType],
              }));
              setSelectedDonors([row.original]);
              setShowSendNotificationModal(true);
            }}
            title="Send Notification"
          >
            <Bell className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Define columns for the donation events table
  const eventColumns = [
    {
      accessorKey: 'title',
      header: 'Event Title',
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => `${row.original.currentRegistrations}/${row.original.maxCapacity}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // View event details
            }}
            title="View Details"
          >
            <Calendar className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle sending notifications about this event
              setNotificationData(prev => ({
                ...prev,
                title: `Blood Donation: ${row.original.title}`,
                message: `Join us for a blood donation event at ${row.original.location} on ${row.original.date} from ${row.original.startTime} to ${row.original.endTime}.`,
              }));
              setShowSendNotificationModal(true);
            }}
            title="Notify Donors"
          >
            <Bell className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Render create event modal
  const renderCreateEventModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCreateEventModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create Donation Event</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Title</label>
            <Input
              value={newEventData.title}
              onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location Name</label>
            <Input
              value={newEventData.location}
              onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={newEventData.address}
              onChange={(e) => setNewEventData({ ...newEventData, address: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input
              type="date"
              value={newEventData.date}
              onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input
                type="time"
                value={newEventData.startTime}
                onChange={(e) => setNewEventData({ ...newEventData, startTime: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input
                type="time"
                value={newEventData.endTime}
                onChange={(e) => setNewEventData({ ...newEventData, endTime: e.target.value })}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={newEventData.description}
              onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Organizer Name</label>
            <Input
              value={newEventData.organizerName}
              onChange={(e) => setNewEventData({ ...newEventData, organizerName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Organizer Contact</label>
            <Input
              value={newEventData.organizerContact}
              onChange={(e) => setNewEventData({ ...newEventData, organizerContact: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max Capacity</label>
            <Input
              type="number"
              value={newEventData.maxCapacity}
              onChange={(e) => setNewEventData({ ...newEventData, maxCapacity: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowCreateEventModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            disabled={isCreatingEvent}
          >
            {isCreatingEvent ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render send notification modal
  const renderSendNotificationModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showSendNotificationModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Send Notification to Donors</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={notificationData.title}
              onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <Textarea
              value={notificationData.message}
              onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
              rows={4}
            />
          </div>
          
          {selectedDonors.length > 0 ? (
            <div>
              <label className="block text-sm font-medium mb-2">Selected Recipients ({selectedDonors.length})</label>
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md max-h-24 overflow-y-auto">
                <ul className="text-sm">
                  {selectedDonors.map(donor => (
                    <li key={donor.id} className="flex items-center justify-between py-1">
                      <span>{donor.fullName || donor.username} ({donor.bloodType})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleDonorSelection(donor)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Blood Types</label>
                <div className="flex flex-wrap gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <Button
                      key={type}
                      variant={notificationData.bloodTypes.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setNotificationData(prev => {
                          if (prev.bloodTypes.includes(type)) {
                            return {
                              ...prev,
                              bloodTypes: prev.bloodTypes.filter(t => t !== type)
                            };
                          } else {
                            return {
                              ...prev,
                              bloodTypes: [...prev.bloodTypes, type]
                            };
                          }
                        });
                      }}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Distance (km)</label>
                <Input
                  type="number"
                  value={notificationData.maxDistance}
                  onChange={(e) => setNotificationData({ ...notificationData, maxDistance: parseInt(e.target.value) || 10 })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="eligible-only"
                  checked={notificationData.includeOnlyEligible}
                  onChange={(e) => setNotificationData({ ...notificationData, includeOnlyEligible: e.target.checked })}
                />
                <label htmlFor="eligible-only" className="text-sm font-medium">
                  Include only donors eligible to donate
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowSendNotificationModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            disabled={isSendingNotification}
          >
            {isSendingNotification ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Volunteer Dashboard</h1>
        
        <Tabs defaultValue="donors">
          <TabsList className="mb-4">
            <TabsTrigger value="donors" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Manage Donors</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Donation Events</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="donors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Donors</CardTitle>
                    <CardDescription>View and manage donor information</CardDescription>
                  </div>
                  
                  <Button onClick={() => setShowSendNotificationModal(true)} className="flex items-center gap-1.5">
                    <Bell className="h-4 w-4" />
                    <span>Send Notification</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search donors..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="whitespace-nowrap text-sm">Blood Type:</label>
                    <select
                      className="border rounded p-1.5 text-sm"
                      value={bloodTypeFilter}
                      onChange={(e) => setBloodTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                
                <DataTable
                  columns={donorColumns}
                  data={filteredUsers}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Blood Donation Events</CardTitle>
                    <CardDescription>Schedule and manage donation events</CardDescription>
                  </div>
                  
                  <Button onClick={() => setShowCreateEventModal(true)} className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {donationEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No events scheduled. Create one to get started!
                  </div>
                ) : (
                  <DataTable
                    columns={eventColumns}
                    data={donationEvents}
                    loading={loading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {renderCreateEventModal()}
      {renderSendNotificationModal()}
    </>
  );
};

export default VolunteerDashboard;