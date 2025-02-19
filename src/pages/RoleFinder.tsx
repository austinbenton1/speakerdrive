import React, { useState } from 'react';
import { UserRound, AlertCircle, MapPin, Briefcase, Building2, Award, Users, Globe, Link } from 'lucide-react';
import StepIndicator from '../components/role-finder/StepIndicator';
import { findRole } from '../lib/api/roleFinder';
import type { RoleFinderResponse } from '../lib/api/roleFinder';

export default function RoleFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoleFinderResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      company_name: formData.get('companyName') as string,
      company_domain: formData.get('companyDomain') as string,
      job_title: formData.get('jobTitle') as string,
    };

    try {
      setIsSearching(true);
      setError(null);
      setCurrentStep(2);
      
      const response = await findRole(data);
      
      if (response.status === 'error') {
        setError(response.message);
        setCurrentStep(1);
        setResult(null);
        return;
      }
      
      setResult(response);
      setCurrentStep(3);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find role information. Please try again.';
      setError(errorMessage);
      setCurrentStep(1);
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header section */}
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
            Role Finder
          </h1>
          <p className="text-[#4B5563] text-base">
            Discover and verify job roles. Find accurate position details to enhance your prospecting efforts.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex justify-center">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                defaultValue="leadmagic"
                placeholder="Example Company Inc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="companyDomain" className="block text-sm font-medium text-gray-700 mb-1">
                Company Domain
              </label>
              <input
                type="text"
                name="companyDomain"
                id="companyDomain"
                defaultValue="leadmagic.io"
                placeholder="example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                id="jobTitle"
                defaultValue="ceo"
                placeholder="Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className={`
                w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg
                text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isSearching ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <UserRound className="w-5 h-5 mr-2" />
                  Find Role
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results section */}
        {result && result.status === 'success' && (
          <div className="mt-6">
            <div className="rounded-xl shadow-lg overflow-hidden bg-emerald-100 border border-emerald-200">
              {/* Main role information */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Profile Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <UserRound className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-emerald-900">
                        {result.name}
                      </h3>
                      <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-white rounded-full shadow-sm">
                        {result.message}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center text-emerald-800">
                        <Building2 className="w-4 h-4 mr-1.5 text-emerald-700" />
                        {result.company_name}
                      </div>
                      <a 
                        href={`https://${result.company_website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-emerald-800 hover:text-emerald-950 hover:underline"
                      >
                        <Globe className="w-4 h-4 mr-1.5 text-emerald-700" />
                        {result.company_website}
                      </a>
                    </div>
                    <div className="mt-2">
                      <a 
                        href={result.profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-emerald-800 hover:text-emerald-950 hover:underline"
                      >
                        {result.profile_url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
