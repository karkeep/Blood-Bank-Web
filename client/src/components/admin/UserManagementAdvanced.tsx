import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, UserPlus, Edit, Trash2, Search, Filter,
  UserCheck, UserX, Shield, Crown, User, Heart,
  Mail, Phone, MapPin, Calendar, MoreHorizontal,
  Ban, CheckCircle, AlertCircle, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'donor' | 'volunteer' | 'moderator' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  bloodType: string;
  phoneNumber?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  joinDate: string;
  lastActive: string;
  donationCount?: number;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  profileImage?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        fullName: 'John Doe',
        role: 'donor',
        status: 'active',
        bloodType: 'O+',
        phoneNumber: '+1234567890',
        location: { city: 'New York', state: 'NY', country: 'USA' },
        joinDate: '2024-01-15',
        lastActive: '2024-05-20',
        donationCount: 5,
        verificationStatus: 'verified'
      },
      {
        id: '2',
        username: 'jane_smith',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
        role: 'moderator',
        status: 'active',
        bloodType: 'A-',
        phoneNumber: '+1234567891',
        location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
        joinDate: '2024-02-10',
        lastActive: '2024-05-22',
        donationCount: 3,
        verificationStatus: 'verified'
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };