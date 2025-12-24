import React from 'react';
import { Route } from 'wouter';
import { useAuth } from '@/hooks/use-auth-firebase';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import DonorDirectory from '@/components/dashboard/DonorDirectory';
import EmergencyRequestList from '@/components/dashboard/EmergencyRequestList';
import BloodInventoryStatus from '@/components/dashboard/BloodInventoryStatus';
import DonationHistory from '@/components/dashboard/DonationHistory';
import CreateEmergencyRequest from '@/components/dashboard/CreateEmergencyRequest';
import UserProfile from '@/components/dashboard/UserProfile';
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import HomePage from '@/components/HomePage';
import NotFoundPage from '@/components/NotFoundPage';
import UserManagement from '@/components/management/UserManagement';
import VolunteerDashboard from '@/components/management/VolunteerDashboard';
import ModeratorDashboard from '@/components/management/ModeratorDashboard';
import SuperAdminDashboard from '@/components/management/SuperAdminDashboard';
import BloodBankManagement from '@/components/management/BloodBankManagement';
import BloodBankMap from '@/components/management/BloodBankMap';

// Protected route component
interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requiredRole?: string | null;
  [x: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  requiredRole = null, 
  ...rest 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <LoginPage />;
  }
  
  if (requiredRole) {
    // Handle different role requirements
    if (requiredRole === 'superadmin' && user.role !== 'superadmin') {
      return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Super Admin Access Required</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
      </div>;
    }
    
    if (requiredRole === 'admin' && !['superadmin', 'admin'].includes(user.role)) {
      return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
      </div>;
    }
    
    if (requiredRole === 'moderator' && !['superadmin', 'admin', 'moderator'].includes(user.role)) {
      return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Moderator Access Required</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
      </div>;
    }
    
    if (requiredRole === 'volunteer' && !['superadmin', 'admin', 'moderator', 'volunteer'].includes(user.role)) {
      return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Volunteer Access Required</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
      </div>;
    }
  }
  
  return <Component {...rest} />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Function to determine the appropriate dashboard based on user role
  const getDashboardComponent = () => {
    if (!user) return UserDashboard;
    
    switch(user.role) {
      case 'superadmin':
        return SuperAdminDashboard;
      case 'admin':
        return AdminDashboard;
      case 'moderator':
        return ModeratorDashboard;
      case 'volunteer':
        return VolunteerDashboard;
      default:
        return UserDashboard;
    }
  };
  
  return (
    <>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Dynamic dashboard route based on user role */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={getDashboardComponent()} />}
      </Route>
      
      {/* User management route (accessible by superadmin, admin) */}
      <Route path="/users">
        {() => <ProtectedRoute component={UserManagement} requiredRole="admin" />}
      </Route>
      
      {/* Protected user routes */}
      <Route path="/donors">
        {() => <ProtectedRoute component={DonorDirectory} />}
      </Route>
      <Route path="/requests">
        {() => <ProtectedRoute component={EmergencyRequestList} />}
      </Route>
      <Route path="/inventory">
        {() => <ProtectedRoute component={BloodInventoryStatus} />}
      </Route>
      <Route path="/donations">
        {() => <ProtectedRoute component={DonationHistory} />}
      </Route>
      <Route path="/create-request">
        {() => <ProtectedRoute component={CreateEmergencyRequest} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={UserProfile} />}
      </Route>
      
      {/* Role-specific routes */}
      <Route path="/superadmin">
        {() => <ProtectedRoute component={SuperAdminDashboard} requiredRole="superadmin" />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} requiredRole="admin" />}
      </Route>
      <Route path="/moderator">
        {() => <ProtectedRoute component={ModeratorDashboard} requiredRole="moderator" />}
      </Route>
      <Route path="/volunteer">
        {() => <ProtectedRoute component={VolunteerDashboard} requiredRole="volunteer" />}
      </Route>
      
      {/* Blood Bank Management */}
      <Route path="/bloodbanks">
        {() => <ProtectedRoute component={BloodBankManagement} requiredRole="superadmin" />}
      </Route>
      <Route path="/bloodbank-map">
        {() => <ProtectedRoute component={BloodBankMap} />}
      </Route>
      
      {/* 404 route */}
      <Route component={NotFoundPage} />
    </>
  );
};

export default AppRoutes;
