import React, { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import StepIndicator from '../components/contact-finder/StepIndicator';
import SearchForm from '../components/contact-finder/SearchForm';
import SearchResult from '../components/contact-finder/SearchResult';
import { findEmail } from '../lib/api/emailFinder';

interface SearchResult {
  email: string;
  status: 'valid' | 'invalid' | 'unknown';
  first_name: string;
  last_name: string;
  company_domain: string;
}

export default function ContactFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSearch = async (data: { fullName: string; companyDomain: string }) => {
    try {
      setIsSearching(true);
      setError(null);
      setCurrentStep(2);

      const response = await findEmail({
        query: data.fullName,
        company_domain: data.companyDomain
      });

      setResult(response);
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to find email address. Please try again.');
      setCurrentStep(1);
    } finally {
      setIsSearching(false);
    }
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
          <StepIndicator currentStep={currentStep} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SearchForm onSubmit={handleSearch} isLoading={isSearching} />
        </div>

        {result && (
          <div className="mt-6">
            <SearchResult
              email={result.email}
              status={result.status}
              firstName={result.first_name}
              lastName={result.last_name}
              companyDomain={result.company_domain}
            />
          </div>
        )}

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