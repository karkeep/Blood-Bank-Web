import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Helmet } from 'react-helmet';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardComponent from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import DonorManagement from '@/components/admin/DonorManagement';
import BloodInventory from '@/components/admin/BloodInventory';
import EmergencyRequests from '@/components/admin/EmergencyRequests';
import AdminStats from '@/components/admin/AdminStats';
import { Footer } from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isLoading, initialized } = useAuth();
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Extract the active section from the URL
    if (location.includes('/admin/users')) {
      setActiveSection('users');
    } else if (location.includes('/admin/donors')) {
      setActiveSection('donors');
    } else if (location.includes('/admin/inventory')) {
      setActiveSection('inventory');
    } else if (location.includes('/admin/requests')) {
      setActiveSection('requests');
    } else if (location.includes('/admin/analytics')) {
      setActiveSection('analytics');
    } else {
      setActiveSection('overview');
    }
  }, [location]);

  // Show loading state while checking authentication
  if (isLoading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  // AdminProtectedRoute handles admin verification, so if we reach here, user is admin
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Blood Bank</title>
        <meta name="description" content="Blood Bank administrative dashboard for managing donors, requests, and monitoring the blood donation network." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        
        <div className="flex flex-1">
          <AdminSidebar activeSection={activeSection} />
          
          <main className="flex-grow py-6 px-4 bg-gray-50">
            <div className="container mx-auto">
              {activeSection === 'overview' && <AdminDashboardComponent />}
              {activeSection === 'users' && <UserManagement />}
              {activeSection === 'donors' && <DonorManagement />}
              {activeSection === 'inventory' && <BloodInventory />}
              {activeSection === 'requests' && <EmergencyRequests />}
              {activeSection === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                  <AdminStats />
                </div>
              )}
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;