import React from 'react';
import { Link } from 'wouter';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">Sorry, the page you're looking for doesn't exist.</p>
        
        <Link href="/">
          <span className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 inline-block cursor-pointer transition-colors">
            Return to Homepage
          </span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;