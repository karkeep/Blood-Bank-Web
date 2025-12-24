import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth-firebase';

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  hideFooter = false,
  hideHeader = false,
}) => {
  const { isLoading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Header />}
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          children
        )}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;