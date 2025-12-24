// src/components/ui/information-page.tsx
import React from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface InformationPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function InformationPage({ 
  title, 
  description = "", 
  children 
}: InformationPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-red-800 mb-6">{title}</h1>
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-red-200">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}