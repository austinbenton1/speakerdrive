import React from 'react';
import { MessageSquare } from 'lucide-react';
import RequestLeadForm from './RequestLeadForm';

export default function RequestLead() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Request Lead</h2>
          <p className="text-sm text-gray-500">Share your preferences</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <MessageSquare className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      
      <RequestLeadForm />
    </div>
  );
}