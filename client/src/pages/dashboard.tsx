import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth-firebase';
import UserDashboard from '@/components/dashboard/UserDashboard';
import MainLayout from '@/components/layout/main-layout';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { user, isLoading, initialized } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // If authentication has been initialized and user is not logged in
    if (initialized && !isLoading && !user) {
      // Redirect to login
      setLocation('/auth');
    }
    
    // If user is admin, redirect to admin dashboard
    if (user?.isAdmin) {
      setLocation('/admin');
    }
  }, [user, isLoading, initialized, setLocation]);
  
  if (isLoading || !initialized) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </MainLayout>
    );
  }
  
  if (!user) {
    return null; // Will be redirected by useEffect
  }
  
  return (
    <MainLayout>
      <Helmet>
        <title>Dashboard - Jiwandan Blood Donation Network</title>
        <meta name="description" content="Your personal Jiwandan dashboard for managing blood donations, finding donors, and responding to emergency requests." />
      </Helmet>
      
      <UserDashboard />
    </MainLayout>
  );
};

export default DashboardPage;