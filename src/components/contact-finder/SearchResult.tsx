import React from 'react';
import { Mail, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface SearchResultProps {
  email: string;
  status: 'valid' | 'invalid' | 'unknown';
  firstName: string;
  lastName: string;
  companyDomain: string;
}

export default function SearchResult({ 
  email, 
  status, 
  firstName, 
  lastName, 
  companyDomain 
}: SearchResultProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'valid':
        return 'text-green-500';
      case 'invalid':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Email Found</h3>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-500">Email Address</label>
          <p className={`mt-1 text-lg font-medium ${getStatusColor()}`}>{email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">First Name</label>
            <p className="mt-1 text-gray-900">{firstName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Last Name</label>
            <p className="mt-1 text-gray-900">{lastName}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Company Domain</label>
          <p className="mt-1 text-gray-900">{companyDomain}</p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigator.clipboard.writeText(email)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Copy Email Address
          </button>
        </div>
      </div>
    </div>
  );
}