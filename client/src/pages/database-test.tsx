import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/seed-data';
import { useDonors, useEmergencyRequests, useBloodInventory, useDashboardStats } from '@/hooks/use-data';
import { Loader2, Database, Users, Heart, Activity, RefreshCw } from 'lucide-react';

export default function DatabaseTestPage() {
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  
  const { donors, loading: donorsLoading, error: donorsError, refetch: refetchDonors } = useDonors();
  const { requests, loading: requestsLoading, error: requestsError, refetch: refetchRequests } = useEmergencyRequests();
  const { inventory, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useBloodInventory();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      await seedDatabase();
      
      toast({
        title: "Database Seeded",
        description: "Sample data has been added to the database successfully.",
      });
      
      // Refresh all data
      setTimeout(() => {
        refetchDonors();
        refetchRequests();
        refetchInventory();
        refetchStats();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Seeding Failed",
        description: "Failed to seed database. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };
  const refreshAllData = async () => {
    await Promise.all([
      refetchDonors(),
      refetchRequests(),
      refetchInventory(),
      refetchStats()
    ]);
    
    toast({
      title: "Data Refreshed",
      description: "All data has been refreshed from the database.",
    });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Database Integration Test</h1>
            <p className="text-gray-600 mt-2">Test Firebase real-time database integration</p>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={refreshAllData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={handleSeedDatabase} disabled={seeding}>
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Seed Database
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Donors</p>
                  <div className="text-2xl font-bold">{statsLoading ? '...' : donors?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emergency Requests</p>
                  <div className="text-2xl font-bold">{requestsLoading ? '...' : requests?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blood Units</p>
                  <div className="text-2xl font-bold">{inventoryLoading ? '...' : inventory?.reduce((sum, item) => sum + item.units, 0) || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="text-lg font-bold text-green-600">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Donors ({donors?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {donorsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : donorsError ? (
                <div className="text-red-600 text-center py-4">Error: {donorsError}</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {donors?.map(donor => (
                    <div key={donor.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{donor.username}</div>
                        <div className="text-sm text-gray-600">{donor.bloodType} • {donor.city}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        donor.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {donor.status}
                      </div>
                    </div>
                  )) || <div className="text-center text-gray-500 py-4">No donors found</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Requests ({requests?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : requestsError ? (
                <div className="text-red-600 text-center py-4">Error: {requestsError}</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {requests?.map(request => (
                    <div key={request.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{request.bloodType} for {request.patientName}</div>
                          <div className="text-sm text-gray-600">{request.hospital}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          request.urgencyLevel === 'critical' ? 'bg-red-100 text-red-700' : 
                          request.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {request.urgencyLevel}
                        </div>
                      </div>
                    </div>
                  )) || <div className="text-center text-gray-500 py-4">No emergency requests</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}