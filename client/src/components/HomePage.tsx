import React from 'react';
import { Link } from 'wouter';
import { JiwandanLogo } from '@/components/ui/jiwandan-logo';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <header className="py-6 w-full bg-red-600 text-white text-center mb-8">
        <div className="flex items-center justify-center">
          <JiwandanLogo size="lg" withText={true} textClassName="text-3xl" />
        </div>
        <p className="text-lg mt-2">Donate Blood, Save Lives</p>
      </header>
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Jiwandan</h2>
          <p className="mb-4">
            Blood donation is a critical service that helps save countless lives every day.
            Our mission is to connect blood donors with those in need through an efficient
            coordination system.
          </p>
          
          <div className="flex justify-center gap-4 my-8">
            <Link href="/login">
              <a className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Login
              </a>
            </Link>
            <Link href="/register">
              <a className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Register
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-red-700 mb-2">For Donors</h3>
              <p>
                Register as a donor and be notified when your blood type is needed in your area.
                Track your donation history and impact.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium text-blue-700 mb-2">For Patients</h3>
              <p>
                Submit requests for blood donations and get connected with compatible donors
                quickly during emergencies.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-6 bg-gray-800 text-white text-center mt-auto">
        <p>&copy; 2025 Jiwandan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;