import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

type PageLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
};

export function PageLayout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = ''
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && <Header />}
      
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

export function Container({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`container mx-auto px-4 md:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Section({ 
  children, 
  className = '',
  id
}: { 
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      {children}
    </section>
  );
}

export function Card({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}
