import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-firebase";
import { Badge } from "@/components/ui/badge";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { 
  HeartPulse, 
  Bell, 
  User, 
  Menu, 
  LogOut, 
  Settings, 
  X, 
  AlertTriangle, 
  Droplet, 
  BarChart2, 
  Users, 
  Home, 
  ShieldAlert 
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white border-b">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <HeartPulse className="h-6 w-6 text-red-600 mr-2" />
          <span className="font-bold text-lg">Blood Bank Admin</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            User Dashboard
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline-block">
                  {user?.username || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center gap-2 p-2">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 rounded-full bg-secondary p-1" />
                </div>
                <div>
                  <div className="font-medium">{user?.username || 'Admin'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
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

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <HeartPulse className="h-6 w-6 text-red-600 mr-2" />
          <span className="font-bold text-lg">Blood Bank Admin</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="flex items-center justify-between">
                <SheetTitle className="flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  Admin Menu
                </SheetTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </SheetHeader>
              
              <div className="py-4">
                <div className="flex items-center gap-3 mb-6 p-3 bg-secondary/30 rounded-lg">
                  <User className="h-8 w-8 rounded-full bg-secondary p-1" />
                  <div>
                    <div className="font-medium">{user?.username || 'Admin'}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary" className="text-xs flex items-center">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Administrator
                      </Badge>
                      {user?.bloodType && (
                        <BloodTypeBadge type={user.bloodType} size="sm" className="ml-2" />
                      )}
                    </div>
                  </div>
                </div>
                
                <nav className="space-y-1 mt-4">
                  <a 
                    href="/dashboard" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    User Dashboard
                  </a>
                  <a 
                    href="/admin" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart2 className="h-5 w-5" />
                    Admin Overview
                  </a>
                  <a 
                    href="/admin/users" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    User Management
                  </a>
                  <a 
                    href="/admin/donors" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HeartPulse className="h-5 w-5" />
                    Donor Management
                  </a>
                  <a 
                    href="/admin/inventory" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Droplet className="h-5 w-5" />
                    Blood Inventory
                  </a>
                  <a 
                    href="/admin/requests" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Requests
                  </a>
                </nav>
                
                <div className="mt-6 pt-6 border-t space-y-1">
                  <a 
                    href="/profile" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </a>
                  <a 
                    href="/settings" 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </a>
                  <button 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20 w-full text-left"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;