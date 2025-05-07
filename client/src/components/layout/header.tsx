import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Menu, User, ChevronDown, LogOut } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-3">
          <div className="flex items-center mb-3 md:mb-0">
            <Link href="/">
              <a className="text-primary font-bold text-2xl">
                Life<span className="text-accent">Link</span>
              </a>
            </Link>
            <div className="hidden md:flex ml-8 space-x-6">
              <Link href="/">
                <a className={`text-gray-700 hover:text-primary font-medium ${location === "/" ? "text-primary" : ""}`}>
                  Home
                </a>
              </Link>
              <Link href="/find-donors">
                <a className={`text-gray-700 hover:text-primary font-medium ${location === "/find-donors" ? "text-primary" : ""}`}>
                  Find Donors
                </a>
              </Link>
              {user && (
                <Link href="/profile">
                  <a className={`text-gray-700 hover:text-primary font-medium ${location === "/profile" ? "text-primary" : ""}`}>
                    My Profile
                  </a>
                </Link>
              )}
              {user && user.isAdmin && (
                <Link href="/admin">
                  <a className={`text-gray-700 hover:text-primary font-medium ${location === "/admin" ? "text-primary" : ""}`}>
                    Admin
                  </a>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-accent hover:text-accent-dark font-medium">
                    <User className="h-4 w-4 mr-1" />
                    <span className="ml-1">{user.username}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="flex items-center text-accent hover:text-accent-dark font-medium">
                  <User className="h-4 w-4 mr-1" />
                  <span>Login / Register</span>
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden text-gray-700" 
              onClick={toggleMobileMenu}
            >
              <Menu />
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="py-3 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <a 
                  className={`text-gray-700 hover:text-primary font-medium py-1 ${location === "/" ? "text-primary" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
              </Link>
              <Link href="/find-donors">
                <a 
                  className={`text-gray-700 hover:text-primary font-medium py-1 ${location === "/find-donors" ? "text-primary" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Donors
                </a>
              </Link>
              {user && (
                <Link href="/profile">
                  <a 
                    className={`text-gray-700 hover:text-primary font-medium py-1 ${location === "/profile" ? "text-primary" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </a>
                </Link>
              )}
              {user && user.isAdmin && (
                <Link href="/admin">
                  <a 
                    className={`text-gray-700 hover:text-primary font-medium py-1 ${location === "/admin" ? "text-primary" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </a>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
