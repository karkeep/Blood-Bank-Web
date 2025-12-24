import React from 'react';
import { AuthProvider } from '../hooks/use-auth-firebase';
import { NotificationsProvider } from './notifications-provider';
import { Toaster } from '@/components/ui/toaster';

// App provider component that wraps all other providers
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <NotificationsProvider>
          <Toaster />
          {children}
        </NotificationsProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};
