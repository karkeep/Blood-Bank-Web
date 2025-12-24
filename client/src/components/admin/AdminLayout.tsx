import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Users, Shield, Heart, Activity, BarChart3, Settings, Bell,
  Menu, LogOut, User, ChevronDown, Database, AlertTriangle,
  FileText, MapPin, Calendar, Zap, UserCheck, UserX,
  Building2, Truck, Package, Eye
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminLayout = ({ children, activeSection, onSectionChange }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      section: 'overview',
      label: 'Dashboard Overview',
      icon: BarChart3,
      description: 'System analytics and key metrics'
    },
    {
      section: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage all platform users'
    },
    {
      section: 'roles',
      label: 'Role Management',
      icon: Shield,
      description: 'Manage admin, moderator roles'
    },
    {
      section: 'donors',
      label: 'Donor Management',
      icon: Heart,
      description: 'Manage donor profiles and status'
    }