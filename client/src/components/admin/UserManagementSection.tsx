import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Edit, Trash2, Search, UserCheck, UserX } from 'lucide-react';

const UserManagementSection = () => {
  const [users] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'donor', status: 'active', bloodType: 'O+', lastActive: '2024-05-20' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', status: 'active', bloodType: 'A-', lastActive: '2024-05-22' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'volunteer', status: 'inactive', bloodType: 'B+', lastActive: '2024-05-15' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search users..." className="pl-10 w-64" />
          </div>
          <Button><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Blood Type</th>
                  <th className="text-left py-2">Last Active</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge></td>
                    <td><Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge></td>
                    <td><Badge variant="outline">{user.bloodType}</Badge></td>
                    <td className="text-sm text-gray-500">{user.lastActive}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost"><UserCheck className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSection;