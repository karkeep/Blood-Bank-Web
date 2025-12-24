import React from 'react';
import { useLocation } from 'wouter';
import { 
  BarChart3, 
  Users, 
  HeartPulse, 
  Droplet,
  AlertTriangle,
  Settings,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeSection: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection }) => {
  const [, navigate] = useLocation();
  
  const sidebarItems = [
    {
      icon: <Home className="h-5 w-5" />,
      name: 'Dashboard',
      path: '/admin',
      active: activeSection === 'overview'
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: 'User Management',
      path: '/admin/users',
      active: activeSection === 'users'
    },
    {
      icon: <HeartPulse className="h-5 w-5" />,
      name: 'Donor Management',
      path: '/admin/donors',
      active: activeSection === 'donors'
    },
    {
      icon: <Droplet className="h-5 w-5" />,
      name: 'Blood Inventory',
      path: '/admin/inventory',
      active: activeSection === 'inventory'
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      name: 'Emergency Requests',
      path: '/admin/requests',
      active: activeSection === 'requests'
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      name: 'Analytics',
      path: '/admin/analytics',
      active: activeSection === 'analytics'
    },
    {
      icon: <Settings className="h-5 w-5" />,
      name: 'Settings',
      path: '/settings',
      active: activeSection === 'settings'
    }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;