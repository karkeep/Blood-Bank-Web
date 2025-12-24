import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Button } from '@/components/ui/button';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  Droplet,
  AlertTriangle,
  Activity,
  Bell,
  BarChart2,
  X,
  Home,
  HeartPulse
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminNavProps {
  activePage?: string;
}

export const AdminNav: React.FC<AdminNavProps> = ({ activePage = 'dashboard' }) => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: <Home className="h-5 w-5" />,
      active: activePage === 'dashboard' || activePage === 'overview',
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      active: activePage === 'users',
    },
    {
      name: 'Donor Management',
      path: '/admin/donors',
      icon: <HeartPulse className="h-5 w-5" />,
      active: activePage === 'donors',
    },
    {
      name: 'Blood Inventory',
      path: '/admin/inventory',
      icon: <Droplet className="h-5 w-5" />,
      active: activePage === 'inventory',
    },
    {
      name: 'Emergency Requests',
      path: '/admin/requests',
      icon: <AlertTriangle className="h-5 w-5" />,
      active: activePage === 'requests',
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart2 className="h-5 w-5" />,
      active: activePage === 'analytics',
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex h-16 items-center border-b px-4 bg-background">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <a href="/" className="flex items-center mr-6">
              <HeartPulse className="h-6 w-6 text-red-600 mr-2" />
              <span className="font-bold text-lg">Jiwandan</span>
              <span className="border-l ml-2 pl-2 text-sm text-muted-foreground">Admin</span>
            </a>
            
            <nav className="flex items-center space-x-4">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="mr-2"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user?.username || 'User'}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Home className="h-4 w-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex h-16 items-center justify-between border-b px-4 bg-background">
        <a href="/" className="flex items-center">
          <HeartPulse className="h-6 w-6 text-red-600 mr-2" />
          <span className="font-bold text-lg">Jiwandan</span>
          <span className="border-l ml-2 pl-2 text-sm text-muted-foreground">Admin</span>
        </a>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="mr-2"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-96">
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HeartPulse className="h-6 w-6 text-red-600 mr-2" />
                    <span>Jiwandan Admin</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </SheetTitle>
                <SheetDescription>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user?.username || 'Admin User'}</span>
                  </div>
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="py-4">
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.path}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md",
                          item.active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-primary"
                        )}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </a>
                    ))}
                  </div>
                  
                  <div className="pt-6 space-y-1">
                    <div className="px-3 text-xs font-semibold text-muted-foreground">
                      User Options
                    </div>
                    <a
                      href="/dashboard"
                      className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-md"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Home className="h-5 w-5 mr-2" />
                      User Dashboard
                    </a>
                    <a
                      href="/profile"
                      className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-md"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-md"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileNavOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default AdminNav;