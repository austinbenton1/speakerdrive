import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import StepIndicator from '../components/contact-finder/StepIndicator';
import SearchForm from '../components/contact-finder/SearchForm';
import SearchResult from '../components/contact-finder/SearchResult';

interface SearchResponse {
  email: string | null;
  status: string;
  last_name: string;
  first_name: string;
  company_domain: string;
}

export default function ContactFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (data: any) => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      if (data.error) {
        setError(data.error);
        setSearchResult(null);
      } else {
        setSearchResult(data);
        setError(null);
      }
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 
            style={{
              background: 'linear-gradient(90deg, #0066FF, #00B341, #0066FF)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1.5rem',
              animation: 'gradient 8s ease infinite'
            }}
            className="text-4xl font-bold"
          >
            Email Finder
          </h1>
          <p className="text-[#4B5563] text-base">
            Unlock direct communication channels with decision-makers. Find verified email addresses and start meaningful conversations.
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <StepIndicator currentStep={searchResult ? 3 : 1} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SearchForm onSubmit={handleSearch} isLoading={isSearching} />
          
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {searchResult && <SearchResult result={searchResult} />}
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center text-gray-600 text-xs">
            <Mail className="w-4 h-4 mr-1.5" />
            <span>Need help?</span>
            <a href="#" className="ml-1 text-blue-600 hover:text-blue-700">
              Get support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}