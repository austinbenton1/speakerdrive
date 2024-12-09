import React, { useRef } from 'react';
import { Search, Globe } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const fullNameRef = useRef<HTMLInputElement>(null);
  const companyDomainRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullName = fullNameRef.current?.value || '';
    const companyDomain = companyDomainRef.current?.value || '';

    try {
      const url = new URL('https://piloterr.com/api/v2/email/finder');
      url.searchParams.append('query', encodeURIComponent(fullName));
      url.searchParams.append('company_domain', encodeURIComponent(companyDomain));

      console.log('Making API request to:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'x-api-key': '64c79e28-4b4d-477a-ab93-0d034affaecc',
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      onSubmit(data);
    } catch (error) {
      console.error('Error fetching email:', error);
      onSubmit({ error: error instanceof Error ? error.message : 'Failed to fetch email' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              ref={fullNameRef}
              type="text"
              placeholder="e.g. John Smith"
              defaultValue="Austin Benton"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 text-sm"
            />
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
              ref={companyDomainRef}
              type="text"
              placeholder="e.g. company.com or www.company.com"
              defaultValue="speakerdrive.com"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter domain to find email addresses
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Searching...' : 'Find Email Address'}
      </button>
    </form>
  );
}