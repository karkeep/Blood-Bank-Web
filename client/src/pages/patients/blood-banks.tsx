import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { MapPin, Building, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BloodBanks() {
  return (
    <>
      <Helmet>
        <title>Find Blood Banks - Jiwandan</title>
        <meta
          name="description"
          content="Locate blood banks and donation centers near you. Find the closest place to donate or receive blood products."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-center mb-3 text-gray-900">
                Find Blood Banks
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Locate blood banks and donation centers in your area
              </p>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex gap-2 mb-6">
                  <Input 
                    type="text"
                    placeholder="Enter your location"
                    className="flex-grow"
                  />
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                <div className="flex items-center justify-center text-red-500 py-12">
                  <MapPin className="w-16 h-16" />
                </div>
                <p className="text-gray-500 text-center mb-6">
                  Our blood bank locator feature is coming soon!
                </p>
                <p className="text-gray-500 text-center">
                  We're working on integrating blood bank locations to help you find the nearest donation center.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Building className="h-8 w-8 text-red-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Central Blood Bank</h3>
                  <p className="text-gray-600 mb-3">123 Main Street, Kathmandu</p>
                  <p className="text-gray-600 mb-4">Open: Mon-Sat, 9AM-5PM</p>
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Building className="h-8 w-8 text-red-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">City Medical Center</h3>
                  <p className="text-gray-600 mb-3">456 Hospital Road, Kathmandu</p>
                  <p className="text-gray-600 mb-4">Open: 24 hours, 7 days</p>
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
