import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MapPin, 
  Edit, 
  Trash2,
  Building,
  Phone,
  AtSign,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react';

const BloodBankManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBloodBanks, setFilteredBloodBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBloodBankModal, setShowAddBloodBankModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBloodBank, setEditingBloodBank] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    status: 'active',
    inventoryLevels: {
      'A+': 0,
      'A-': 0,
      'B+': 0,
      'B-': 0,
      'AB+': 0,
      'AB-': 0,
      'O+': 0,
      'O-': 0,
    }
  });
  
  // Fetch blood banks on component mount
  useEffect(() => {
    fetchBloodBanks();
  }, []);
  
  // Filter blood banks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBloodBanks(bloodBanks);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = bloodBanks.filter(
      bb => 
        bb.name.toLowerCase().includes(query) ||
        bb.address.toLowerCase().includes(query) ||
        bb.city.toLowerCase().includes(query)
    );
    
    setFilteredBloodBanks(filtered);
  }, [bloodBanks, searchQuery]);
  
  // Fetch all blood banks
  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bloodbanks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blood banks');
      }
      
      const data = await response.json();
      setBloodBanks(data);
      setFilteredBloodBanks(data);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      
      // Generate mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockData = [
          {
            id: 1,
            name: 'City Hospital Blood Bank',
            address: '123 Main Street',
            city: 'Kathmandu',
            phone: '+977-1-4123456',
            email: 'blood@cityhospital.com',
            website: 'https://cityhospital.com',
            latitude: 27.7172,
            longitude: 85.3240,
            status: 'active',
            inventoryLevels: {
              'A+': 50,
              'A-': 20,
              'B+': 35,
              'B-': 15,
              'AB+': 10,
              'AB-': 5,
              'O+': 75,
              'O-': 25,
            },
            createdBy: 1,
            createdAt: '2025-05-18T12:00:00.000Z',
            updatedAt: '2025-05-18T12:00:00.000Z'
          },
          {
            id: 2,
            name: 'Red Cross Blood Center',
            address: '456 Hospital Road',
            city: 'Pokhara',
            phone: '+977-61-5234567',
            email: 'blood@redcross.org.np',
            website: 'https://redcross.org.np',
            latitude: 28.2096,
            longitude: 83.9856,
            status: 'active',
            inventoryLevels: {
              'A+': 40,
              'A-': 15,
              'B+': 45,
              'B-': 10,
              'AB+': 5,
              'AB-': 3,
              'O+': 60,
              'O-': 20,
            },
            createdBy: 1,
            createdAt: '2025-05-17T10:00:00.000Z',
            updatedAt: '2025-05-17T10:00:00.000Z'
          }
        ];
        
        setBloodBanks(mockData);
        setFilteredBloodBanks(mockData);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('inventory-')) {
      // Handle inventory level changes
      const bloodType = name.replace('inventory-', '');
      setFormData(prev => ({
        ...prev,
        inventoryLevels: {
          ...prev.inventoryLevels,
          [bloodType]: parseInt(value) || 0
        }
      }));
    } else {
      // Handle regular form fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Submit form to create/update blood bank
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate coordinates
      const latitude = parseFloat(formData.latitude);
      const longitude = parseFloat(formData.longitude);
      
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      
      // Prepare request data
      const requestData = {
        ...formData,
        latitude,
        longitude
      };
      
      let response;
      
      if (editingBloodBank) {
        // Update existing blood bank
        response = await fetch(`/api/bloodbanks/${editingBloodBank.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify(requestData)
        });
      } else {
        // Create new blood bank
        response = await fetch('/api/bloodbanks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify(requestData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save blood bank');
      }
      
      const savedBloodBank = await response.json();
      
      // Update blood banks list
      if (editingBloodBank) {
        setBloodBanks(prevBanks => 
          prevBanks.map(bb => 
            bb.id === savedBloodBank.id ? savedBloodBank : bb
          )
        );
        
        toast({
          title: 'Success',
          description: 'Blood bank updated successfully',
        });
      } else {
        setBloodBanks(prevBanks => [...prevBanks, savedBloodBank]);
        
        toast({
          title: 'Success',
          description: 'Blood bank added successfully',
        });
      }
      
      // Reset form and close modal
      resetForm();
      setShowAddBloodBankModal(false);
    } catch (error) {
      console.error('Error saving blood bank:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a blood bank
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blood bank?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bloodbanks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete blood bank');
      }
      
      // Update blood banks list
      setBloodBanks(prevBanks => prevBanks.filter(bb => bb.id !== id));
      
      toast({
        title: 'Success',
        description: 'Blood bank deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting blood bank:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Edit a blood bank
  const handleEdit = (bloodBank) => {
    setEditingBloodBank(bloodBank);
    setFormData({
      name: bloodBank.name,
      address: bloodBank.address,
      city: bloodBank.city,
      phone: bloodBank.phone,
      email: bloodBank.email || '',
      website: bloodBank.website || '',
      latitude: bloodBank.latitude.toString(),
      longitude: bloodBank.longitude.toString(),
      status: bloodBank.status,
      inventoryLevels: bloodBank.inventoryLevels || {
        'A+': 0,
        'A-': 0,
        'B+': 0,
        'B-': 0,
        'AB+': 0,
        'AB-': 0,
        'O+': 0,
        'O-': 0,
      }
    });
    setShowAddBloodBankModal(true);
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      latitude: '',
      longitude: '',
      status: 'active',
      inventoryLevels: {
        'A+': 0,
        'A-': 0,
        'B+': 0,
        'B-': 0,
        'AB+': 0,
        'AB-': 0,
        'O+': 0,
        'O-': 0,
      }
    });
    setEditingBloodBank(null);
  };
  
  // Define columns for blood banks table
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
          <span>{row.original.address}, {row.original.city}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
            <span>{row.original.phone}</span>
          </div>
          {row.original.email && (
            <div className="flex items-center text-xs">
              <AtSign className="h-3 w-3 mr-1 text-slate-400" />
              <span>{row.original.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'inventory',
      header: 'Inventory',
      cell: ({ row }) => {
        const inventoryLevels = row.original.inventoryLevels || {};
        const totalUnits = Object.values(inventoryLevels).reduce((sum, val) => sum + (val || 0), 0);
        
        // Calculate critical levels (less than 10 units)
        const criticalTypes = Object.entries(inventoryLevels)
          .filter(([_, level]) => (level || 0) < 10)
          .map(([type]) => type);
        
        return (
          <div>
            <div className="font-medium">{totalUnits} units total</div>
            {criticalTypes.length > 0 && (
              <div className="text-xs mt-1 text-red-500">
                Low: {criticalTypes.join(', ')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={
          row.original.status === 'active' ? 'bg-green-600' : 'bg-red-600'
        }>
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
  
  // Render add/edit blood bank modal
  const renderBloodBankModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showAddBloodBankModal ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingBloodBank ? 'Edit Blood Bank' : 'Add New Blood Bank'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blood Bank Name*</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City*</label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address*</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number*</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Latitude*</label>
              <Input
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                placeholder="e.g. 27.7172"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Longitude*</label>
              <Input
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                placeholder="e.g. 85.3240"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Inventory Levels</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => (
                <div key={bloodType}>
                  <label className="block text-sm font-medium mb-1">{bloodType}</label>
                  <Input
                    name={`inventory-${bloodType}`}
                    type="number"
                    min="0"
                    value={formData.inventoryLevels[bloodType]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddBloodBankModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingBloodBank ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Blood Bank Management</h1>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Blood Banks</CardTitle>
                <CardDescription>Manage blood banks and their inventory</CardDescription>
              </div>
              
              <Button onClick={() => setShowAddBloodBankModal(true)} className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add Blood Bank</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search blood banks..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <DataTable
              columns={columns}
              data={filteredBloodBanks}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
      
      {renderBloodBankModal()}
    </>
  );
};

export default BloodBankManagement;