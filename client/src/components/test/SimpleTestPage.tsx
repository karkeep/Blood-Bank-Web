import React from 'react';

export function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🩸 Jiwandan Blood Bank
        </h1>
        <p className="text-gray-600 mb-4">
          App is loading successfully! 
        </p>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">React App: ✅ Working</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Tailwind CSS: ✅ Working</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">Firebase: 🔄 Checking...</span>
          </div>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => window.location.href = '/find-donors'}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Go to Find Donors
          </button>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.location.href = '/database-test'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Test Database Connection
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Time: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}