import React, { useState } from 'react';
import { Search, Building2, Globe } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (data: { firstName: string; lastName: string; companyDomain: string }) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [firstName, setFirstName] = useState('Austin');
  const [lastName, setLastName] = useState('Benton');
  const [companyDomain, setCompanyDomain] = useState('speakerdrive.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !companyDomain) return;
    onSubmit({ firstName, lastName, companyDomain });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="John"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Domain
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
              placeholder="e.g. company.com or www.company.com"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter the company domain without http:// or https://
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !firstName || !lastName || !companyDomain}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Searching...' : 'Find Email Address'}
      </button>
    </form>
  );
}