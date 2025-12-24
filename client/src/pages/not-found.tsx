import React from 'react';
import { PageLayout } from "@/components/layout/page-layout";
import { Container, Card } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { JiwandanLogo } from "@/components/ui/jiwandan-logo";
import { Link } from "wouter";
import { Droplets } from "lucide-react";

export default function NotFound() {
  return (
    <PageLayout>
      <Container className="py-16 md:py-24">
        <div className="flex flex-col items-center justify-center text-center">
          <Droplets className="h-16 w-16 text-red-600 mb-6" />
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, 
              deleted, or never existed in the first place.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="px-6">Back to Home</Button>
            </Link>
            
            <div className="flex justify-center text-gray-500 text-sm">
              <p>If you think this is an error, please <a href="/about/contact" className="text-red-600 hover:underline">contact support</a></p>
            </div>
          </div>
          
          <div className="mt-16">
            <p className="text-sm text-gray-500">Error code: 404_PAGE_NOT_FOUND</p>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
