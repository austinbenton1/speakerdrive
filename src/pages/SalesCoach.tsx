import React from 'react';
import { Construction } from 'lucide-react';

export default function SalesCoach() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Construction className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Coach Coming Soon</h1>
        <p className="text-gray-600">
          We're building something special to help you win more opportunities.
        </p>
      </div>
    </div>
  );
}