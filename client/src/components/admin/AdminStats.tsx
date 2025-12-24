import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dbService } from '@/lib/firebase/database';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b', '#6bd4ff', '#ffd16b'];

const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [donationStats, setDonationStats] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [bloodDistribution, setBloodDistribution] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get donations for chart
        const donations = await dbService.getAll('donationRecords');
        
        // Group donations by month
        const groupedDonations = donations.reduce((acc, donation) => {
          const date = new Date(donation.donationDate);
          const month = date.toLocaleString('default', { month: 'short' });
          
          if (!acc[month]) {
            acc[month] = {
              month,
              donations: 0,
              volume: 0
            };
          }
          
          acc[month].donations += 1;
          acc[month].volume += donation.volume;
          
          return acc;
        }, {});
        
        const donationStatsByMonth = Object.values(groupedDonations);
        setDonationStats(donationStatsByMonth);

        // Get blood inventory
        const inventory = await dbService.getAll('bloodInventory');
        setInventoryStats(inventory);
        
        // Process blood type distribution
        const bloodTypes = inventory.map(item => ({
          bloodType: item.bloodType,
          units: item.unitsAvailable
        }));
        setBloodDistribution(bloodTypes);

        // Get users grouped by registration date (month)
        const users = await dbService.getAll('users');
        const groupedUsers = users.reduce((acc, user) => {
          const date = new Date(user.createdAt);
          const month = date.toLocaleString('default', { month: 'short' });
          
          if (!acc[month]) {
            acc[month] = {
              month,
              count: 0,
              donors: 0,
              requesters: 0
            };
          }
          
          acc[month].count += 1;
          
          if (user.role === 'donor') {
            acc[month].donors += 1;
          } else if (user.role === 'requester') {
            acc[month].requesters += 1;
          }
          
          return acc;
        }, {});
        
        const userStatsByMonth = Object.values(groupedUsers);
        setUserStats(userStatsByMonth);
      } catch (error) {
        console.error('Error loading admin statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donation trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={donationStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="donations" stroke="#8884d8" name="Donations" />
                  <Line type="monotone" dataKey="volume" stroke="#82ca9d" name="Volume (mL)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* User registration trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="donors" name="Donors" fill="#8884d8" />
                  <Bar dataKey="requesters" name="Requesters" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Blood inventory distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blood Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ bloodType, percent }) => `${bloodType} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="units"
                    nameKey="bloodType"
                  >
                    {bloodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Inventory status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Status by City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="cityName" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="unitsAvailable" name="Units Available" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
