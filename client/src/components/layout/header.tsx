import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Menu, X, ChevronDown, User, LogOut, Bell, Settings,
  Heart, Droplets, Users, MapPin, AlertCircle, Info,
  FileText, ShieldCheck, Award, Hospital, BookOpen,
  Phone, HelpCircle, Search, Filter, UserPlus, Droplet
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { JiwandanLogo, JiwandanLogoEnhanced } from '@/components/ui/jiwandan-logo';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close profile menu when main menu is toggled
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
    // Close main menu when profile menu is toggled
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Main navigation links
  const mainNavLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Find Donors',
      href: '/find-donors',
      highlight: true,
      icon: <MapPin className="h-4 w-4 mr-2" />
    },
    {
      name: 'Emergency Request',
      href: '/emergency-request',
      urgent: true,
      icon: <AlertCircle className="h-4 w-4 mr-2" />
    },
    {
      name: 'Emergency Rooms',
      href: '/emergency-rooms',
      hospitalBadge: true,
      icon: <Hospital className="h-4 w-4 mr-2" />
    },
    {
      name: 'For Donors',
      submenu: [
        { name: 'How to Donate', href: '/donors/how-to-donate', icon: <Droplet className="h-4 w-4 mr-2" /> },
        { name: 'Eligibility Requirements', href: '/donors/eligibility', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
        { name: 'Donor Safety', href: '/donors/safety', icon: <Heart className="h-4 w-4 mr-2" /> },
        { name: 'Frequent Donor Program', href: '/donors/frequent-program', icon: <Award className="h-4 w-4 mr-2" /> },
        { name: 'Become a Donor', href: '/donors/register', icon: <UserPlus className="h-4 w-4 mr-2" /> }
      ]
    },
    {
      name: 'For Patients',
      submenu: [
        { name: 'Emergency Protocol', href: '/patients/emergency-protocol', icon: <AlertCircle className="h-4 w-4 mr-2" /> },
        { name: 'Hospital Integration', href: '/patients/hospital-integration', icon: <Hospital className="h-4 w-4 mr-2" /> },
        { name: 'Find Blood Banks', href: '/patients/blood-banks', icon: <MapPin className="h-4 w-4 mr-2" /> },
        { name: 'Patient Resources', href: '/patients/resources', icon: <BookOpen className="h-4 w-4 mr-2" /> }
      ]
    },
    {
      name: 'About',
      submenu: [
        { name: 'Our Mission', href: '/about/mission', icon: <Heart className="h-4 w-4 mr-2" /> },
        { name: 'FAQ', href: '/about/faq', icon: <HelpCircle className="h-4 w-4 mr-2" /> },
        { name: 'Privacy Policy', href: '/about/privacy', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
        { name: 'Terms of Service', href: '/about/terms', icon: <FileText className="h-4 w-4 mr-2" /> },
        { name: 'Contact Us', href: '/about/contact', icon: <Phone className="h-4 w-4 mr-2" /> }
      ]
    }
  ];

  // Mobile navigation links - flattened for mobile view
  const mobileNavLinks = [
    { name: 'Home', href: '/', icon: <Heart className="h-5 w-5 mr-2" /> },
    { name: 'Find Donors', href: '/find-donors', icon: <MapPin className="h-5 w-5 mr-2" />, highlight: true },
    { name: 'Emergency Request', href: '/emergency-request', icon: <AlertCircle className="h-5 w-5 mr-2" />, urgent: true },
    { name: 'Emergency Rooms', href: '/emergency-rooms', icon: <Hospital className="h-5 w-5 mr-2" />, hospitalBadge: true },
    { name: 'How to Donate', href: '/donors/how-to-donate', icon: <Droplet className="h-5 w-5 mr-2" /> },
    { name: 'Eligibility Requirements', href: '/donors/eligibility', icon: <ShieldCheck className="h-5 w-5 mr-2" /> },
    { name: 'Donor Safety', href: '/donors/safety', icon: <Heart className="h-5 w-5 mr-2" /> },
    { name: 'Frequent Donor Program', href: '/donors/frequent-program', icon: <Award className="h-5 w-5 mr-2" /> },
    { name: 'Become a Donor', href: '/donors/register', icon: <UserPlus className="h-5 w-5 mr-2" /> },
    { name: 'Find Blood Banks', href: '/patients/blood-banks', icon: <MapPin className="h-5 w-5 mr-2" /> },
    { name: 'Patient Resources', href: '/patients/resources', icon: <BookOpen className="h-5 w-5 mr-2" /> },
    { name: 'Our Mission', href: '/about/mission', icon: <Heart className="h-5 w-5 mr-2" /> },
    { name: 'FAQ', href: '/about/faq', icon: <HelpCircle className="h-5 w-5 mr-2" /> },
    { name: 'Contact Us', href: '/about/contact', icon: <Phone className="h-5 w-5 mr-2" /> }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-lg shadow-black/5" style={{ overflow: 'visible' }}>
      <div className="container mx-auto px-4" style={{ overflow: 'visible' }}>
        <div className="flex justify-between items-center h-16" style={{ overflow: 'visible' }}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <JiwandanLogoEnhanced size="md" withText={true} animated={false} />
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavLinks.map((link) => {
              if (link.submenu) {
                return (
                  <DropdownMenu key={link.name}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600">
                        {link.icon && link.icon}
                        {link.name}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>{link.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {link.submenu.map((subItem) => (
                        <Link key={subItem.name} href={subItem.href}>
                          <DropdownMenuItem className="cursor-pointer">
                            {subItem.icon}
                            <span>{subItem.name}</span>
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              } else {
                return (
                  <Link key={link.name} href={link.href}>
                    <a className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${location === link.href
                      ? 'text-red-600 bg-red-50'
                      : link.highlight
                        ? 'text-red-600 hover:bg-red-50'
                        : link.urgent
                          ? 'text-white bg-red-500 hover:bg-red-600'
                          : (link as any).hospitalBadge
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                            : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                      }`}>
                      {link.icon && link.icon}
                      {link.name}
                      {link.highlight && <Badge variant="outline" className="ml-2 border-red-200 text-red-600 text-xs">Popular</Badge>}
                      {(link as any).hospitalBadge && <Badge variant="outline" className="ml-2 border-blue-200 text-blue-600 text-xs">Live</Badge>}
                    </a>
                  </Link>
                );
              }
            })}
          </nav>

          {/* User menu (desktop) */}
          <div className="hidden md:flex items-center space-x-4" style={{ overflow: 'visible', position: 'relative' }}>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-gray-700 hover:text-red-600">
                    <span className="text-sm font-medium mr-1 max-w-[100px] truncate">
                      {user.username || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[9999]" sideOffset={8}>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/notifications">
                    <DropdownMenuItem className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="text-sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {mobileNavLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${location === link.href
                  ? 'bg-red-50 text-red-600'
                  : link.highlight
                    ? 'text-red-600 bg-red-50'
                    : link.urgent
                      ? 'text-white bg-red-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.name}
                {link.highlight && <Badge variant="outline" className="ml-2 border-red-200 text-red-600 text-xs">Popular</Badge>}
              </a>
            </Link>
          ))}

          {/* Mobile section dividers */}
          <div className="py-2">
            <div className="w-full border-t border-gray-200"></div>
          </div>

          {/* Mobile auth buttons */}
          {user ? (
            <>
              <Link href="/profile">
                <a
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </a>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-4 pb-3">
              <div className="space-y-2 px-4">
                <Link href="/auth">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional: Emergency banner - can be conditionally displayed based on an emergency state */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white text-center py-2 px-4 shadow-md">
        <p className="text-sm font-medium flex items-center justify-center">
          <AlertCircle className="inline h-4 w-4 mr-2" />
          <span>
            Urgent: Critical blood shortage for O- and AB- types in your area.
            <Link href="/find-donors">
              <a className="underline ml-1 font-bold hover:text-red-200">
                Find Donors
              </a>
            </Link>
            <span className="mx-2">•</span>
            <Link href="/emergency-request">
              <a className="underline font-bold hover:text-red-200">
                Request Blood
              </a>
            </Link>
          </span>
        </p>
      </div>
    </header>
  );
}

export default Header;