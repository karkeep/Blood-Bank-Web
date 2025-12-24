import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/firebase/database';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  MoreHorizontal, 
  Search, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  Trash2, 
  Edit,
  Droplet,
  MapPin,
  AlertOctagon,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BloodInventoryItem {
  id: string;
  bloodType: string;
  cityName: string;
  unitsAvailable: number;
  totalCapacity: number;
  status: 'Critical' | 'Low' | 'Normal' | 'Good';
  lastUpdated: string;
  alertThreshold: number;
}

const BloodInventory = () => {
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState<BloodInventoryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    bloodType: 'O+',
    cityName: '',
    unitsAvailable: 0,
    totalCapacity: 100,
    alertThreshold: 20,
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // Load all blood inventory items
      const inventoryItems = await dbService.getAll<BloodInventoryItem>('bloodInventory');
      setInventory(inventoryItems);
    } catch (error) {
      console.error('Error loading blood inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'cityName' ? value : Number(value),
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditItem = (item: BloodInventoryItem) => {
    setSelectedItem(item);
    setFormData({
      id: item.id,
      bloodType: item.bloodType,
      cityName: item.cityName,
      unitsAvailable: item.unitsAvailable,
      totalCapacity: item.totalCapacity,
      alertThreshold: item.alertThreshold,
    });
    setIsEditOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      id: '',
      bloodType: 'O+',
      cityName: '',
      unitsAvailable: 0,
      totalCapacity: 100,
      alertThreshold: 20,
    });
    setIsAddOpen(true);
  };

  const handleSaveItem = async () => {
    if (
      !formData.bloodType || 
      !formData.cityName || 
      formData.unitsAvailable < 0 || 
      formData.totalCapacity <= 0 ||
      formData.alertThreshold < 0 || 
      formData.alertThreshold > 100
    ) {
      alert('Please fill all fields with valid values.');
      return;
    }

    setLoading(true);
    try {
      // Calculate status based on units available
      const percentage = (formData.unitsAvailable / formData.totalCapacity) * 100;
      let status: 'Critical' | 'Low' | 'Normal' | 'Good' = 'Normal';
      
      if (percentage <= formData.alertThreshold) {
        status = 'Critical';
      } else if (percentage <= formData.alertThreshold * 2) {
        status = 'Low';
      } else if (percentage >= 80) {
        status = 'Good';
      }
      
      if (isEditOpen) {
        // Update existing item
        await dbService.update<BloodInventoryItem>('bloodInventory', formData.id, {
          bloodType: formData.bloodType,
          cityName: formData.cityName,
          unitsAvailable: formData.unitsAvailable,
          totalCapacity: formData.totalCapacity,
          status,
          alertThreshold: formData.alertThreshold,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Add new item
        await dbService.create<BloodInventoryItem>('bloodInventory', {
          bloodType: formData.bloodType,
          cityName: formData.cityName,
          unitsAvailable: formData.unitsAvailable,
          totalCapacity: formData.totalCapacity,
          status,
          alertThreshold: formData.alertThreshold,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      setIsEditOpen(false);
      setIsAddOpen(false);
      loadInventory();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }
    
    setLoading(true);
    try {
      await dbService.delete('bloodInventory', itemId);
      loadInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnits = async (itemId: string, change: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    const newUnits = Math.max(0, item.unitsAvailable + change);
    if (newUnits > item.totalCapacity) {
      alert(`Cannot exceed total capacity of ${item.totalCapacity} units.`);
      return;
    }
    
    setLoading(true);
    try {
      // Calculate new status
      const percentage = (newUnits / item.totalCapacity) * 100;
      let status: 'Critical' | 'Low' | 'Normal' | 'Good' = 'Normal';
      
      if (percentage <= item.alertThreshold) {
        status = 'Critical';
      } else if (percentage <= item.alertThreshold * 2) {
        status = 'Low';
      } else if (percentage >= 80) {
        status = 'Good';
      }
      
      await dbService.update<BloodInventoryItem>('bloodInventory', itemId, {
        unitsAvailable: newUnits,
        status,
        lastUpdated: new Date().toISOString(),
      });
      
      loadInventory();
    } catch (error) {
      console.error('Error updating inventory units:', error);
      alert('Failed to update inventory units: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.bloodType.toLowerCase().includes(search.toLowerCase()) ||
      item.cityName.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'critical') return matchesSearch && item.status === 'Critical';
    if (activeTab === 'low') return matchesSearch && item.status === 'Low';
    if (activeTab === 'normal') return matchesSearch && item.status === 'Normal';
    if (activeTab === 'good') return matchesSearch && item.status === 'Good';
    
    return matchesSearch;
  });

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'destructive';
      case 'Low':
        return 'default';
      case 'Normal':
        return 'secondary';
      case 'Good':
        return 'success';
      default:
        return 'outline';
    }
  };

  // Count items by status
  const countsByStatus = inventory.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = 0;
    }
    acc[item.status]++;
    return acc;
  }, {} as Record<string, number>);

  // Count items by blood type
  const countsByBloodType = inventory.reduce((acc, item) => {
    if (!acc[item.bloodType]) {
      acc[item.bloodType] = 0;
    }
    acc[item.bloodType]++;
    return acc;
  }, {} as Record<string, number>);

  // Sum units by blood type
  const unitsByBloodType = inventory.reduce((acc, item) => {
    if (!acc[item.bloodType]) {
      acc[item.bloodType] = 0;
    }
    acc[item.bloodType] += item.unitsAvailable;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Blood Inventory Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadInventory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddItem}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Total Inventory Locations</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="flex justify-between">
                <span>Critical:</span>
                <span>{countsByStatus['Critical'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Low:</span>
                <span>{countsByStatus['Low'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Normal:</span>
                <span>{countsByStatus['Normal'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Good:</span>
                <span>{countsByStatus['Good'] || 0}</span>
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
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Total Units Available</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 gap-1 text-sm">
              {Object.entries(unitsByBloodType).map(([type, units]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span>{units} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
          <TabsTrigger value="normal">Normal</TabsTrigger>
          <TabsTrigger value="good">Good</TabsTrigger>
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
                <TableHead>Blood Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Units Available</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Alert Threshold</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center">
                        <Droplet className="h-3 w-3 mr-1 text-red-500" />
                        {item.bloodType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {item.cityName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.unitsAvailable} units</span>
                          <span>{Math.round((item.unitsAvailable / item.totalCapacity) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(item.unitsAvailable / item.totalCapacity) * 100} 
                          className="h-2"
                          style={{
                            background: (item.unitsAvailable / item.totalCapacity) * 100 < item.alertThreshold ? '#fee2e2' : 
                                       (item.unitsAvailable / item.totalCapacity) * 100 < item.alertThreshold * 2 ? '#fef3c7' : 
                                       (item.unitsAvailable / item.totalCapacity) * 100 >= 80 ? '#dcfce7' : '#f3f4f6'
                          }} 
                        />
                      </div>
                    </TableCell>
                    <TableCell>{item.totalCapacity} units</TableCell>
                    <TableCell>{item.alertThreshold}%</TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleUpdateUnits(item.id, 1)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleUpdateUnits(item.id, -1)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
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
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUnits(item.id, 10)}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add 10 Units
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUnits(item.id, -10)}>
                              <MinusCircle className="h-4 w-4 mr-2" />
                              Remove 10 Units
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Inventory Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update blood inventory information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            
            <div>
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                name="cityName"
                value={formData.cityName}
                onChange={handleInputChange}
                placeholder="Enter city name"
              />
            </div>
            
            <div>
              <Label htmlFor="unitsAvailable">Units Available</Label>
              <Input
                id="unitsAvailable"
                name="unitsAvailable"
                type="number"
                min="0"
                max={formData.totalCapacity}
                value={formData.unitsAvailable}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="totalCapacity">Total Capacity</Label>
              <Input
                id="totalCapacity"
                name="totalCapacity"
                type="number"
                min="1"
                value={formData.totalCapacity}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <Input
                id="alertThreshold"
                name="alertThreshold"
                type="number"
                min="1"
                max="100"
                value={formData.alertThreshold}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage below which the status becomes Critical
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new blood inventory location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            
            <div>
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                name="cityName"
                value={formData.cityName}
                onChange={handleInputChange}
                placeholder="Enter city name"
              />
            </div>
            
            <div>
              <Label htmlFor="unitsAvailable">Units Available</Label>
              <Input
                id="unitsAvailable"
                name="unitsAvailable"
                type="number"
                min="0"
                max={formData.totalCapacity}
                value={formData.unitsAvailable}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="totalCapacity">Total Capacity</Label>
              <Input
                id="totalCapacity"
                name="totalCapacity"
                type="number"
                min="1"
                value={formData.totalCapacity}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <Input
                id="alertThreshold"
                name="alertThreshold"
                type="number"
                min="1"
                max="100"
                value={formData.alertThreshold}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage below which the status becomes Critical
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodInventory;
