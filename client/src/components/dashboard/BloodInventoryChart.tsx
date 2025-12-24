import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplet, Percent } from 'lucide-react';

interface BloodInventoryItem {
  id: string;
  bloodType: string;
  cityName: string;
  unitsAvailable: number;
  totalCapacity: number;
  status: 'Critical' | 'Low' | 'Normal' | 'Good';
}

interface BloodInventoryChartProps {
  inventory: BloodInventoryItem[];
  userBloodType?: string;
}

const BloodInventoryChart: React.FC<BloodInventoryChartProps> = ({ 
  inventory, 
  userBloodType 
}) => {
  // Group inventory by blood type
  const inventoryByBloodType = inventory.reduce((acc, item) => {
    if (!acc[item.bloodType]) {
      acc[item.bloodType] = [];
    }
    acc[item.bloodType].push(item);
    return acc;
  }, {} as Record<string, BloodInventoryItem[]>);
  
  // Calculate total units for each blood type
  const bloodTypeTotals = Object.entries(inventoryByBloodType).map(([bloodType, items]) => {
    const totalUnits = items.reduce((sum, item) => sum + item.unitsAvailable, 0);
    const totalCapacity = items.reduce((sum, item) => sum + item.totalCapacity, 0);
    const percentage = totalCapacity > 0 ? (totalUnits / totalCapacity) * 100 : 0;
    
    // Determine overall status
    let status: 'Critical' | 'Low' | 'Normal' | 'Good' = 'Normal';
    if (percentage < 25) status = 'Critical';
    else if (percentage < 50) status = 'Low';
    else if (percentage >= 80) status = 'Good';
    
    return {
      bloodType,
      totalUnits,
      totalCapacity,
      percentage,
      status,
      cities: items.map(item => ({
        cityName: item.cityName,
        unitsAvailable: item.unitsAvailable,
        status: item.status
      }))
    };
  });
  
  // Sort by blood types with user's blood type first
  bloodTypeTotals.sort((a, b) => {
    if (a.bloodType === userBloodType) return -1;
    if (b.bloodType === userBloodType) return 1;
    return a.bloodType.localeCompare(b.bloodType);
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Blood Inventory Status</h2>
      
      {bloodTypeTotals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bloodTypeTotals.map(bloodTypeData => (
            <Card key={bloodTypeData.bloodType} className={
              bloodTypeData.bloodType === userBloodType ? 'border-primary' : ''
            }>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <Droplet className="w-5 h-5 mr-2 text-red-500" />
                    {bloodTypeData.bloodType}
                    {bloodTypeData.bloodType === userBloodType && (
                      <Badge variant="outline" className="ml-2 text-xs">Your Type</Badge>
                    )}
                  </CardTitle>
                  <Badge variant={
                    bloodTypeData.status === 'Critical' ? 'destructive' : 
                    bloodTypeData.status === 'Low' ? 'default' : 
                    bloodTypeData.status === 'Good' ? 'success' : 'secondary'
                  }>
                    {bloodTypeData.status}
                  </Badge>
                </div>
                <CardDescription>
                  {bloodTypeData.totalUnits} / {bloodTypeData.totalCapacity} units available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Inventory</span>
                      <span className="flex items-center">
                        <Percent className="w-3 h-3 mr-1" />
                        {Math.round(bloodTypeData.percentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={bloodTypeData.percentage} 
                      className="h-2"
                      style={{
                        background: bloodTypeData.percentage < 25 ? '#fee2e2' : 
                                     bloodTypeData.percentage < 50 ? '#fef3c7' : 
                                     bloodTypeData.percentage >= 80 ? '#dcfce7' : '#f3f4f6'
                      }} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">By Location:</h4>
                    {bloodTypeData.cities.map((city, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{city.cityName}:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{city.unitsAvailable} units</span>
                          <Badge variant={
                            city.status === 'Critical' ? 'destructive' : 
                            city.status === 'Low' ? 'default' : 
                            city.status === 'Good' ? 'success' : 'secondary'
                          } className="text-xs">
                            {city.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Droplet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inventory Data Available</h3>
            <p className="text-muted-foreground">
              The blood inventory information is currently unavailable.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodInventoryChart;
