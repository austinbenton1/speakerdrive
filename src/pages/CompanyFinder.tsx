import React, { useState } from 'react';
import { Building2, AlertCircle, MapPin, Briefcase, Globe, Award, Users, Link, Users2 } from 'lucide-react';
import StepIndicator from '../components/company-finder/StepIndicator';
import { findCompany } from '../lib/api/companyFinder';
import type { CompanyFinderResponse } from '../lib/api/companyFinder';

export default function CompanyFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompanyFinderResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      profile_url: formData.get('companyUrl') as string,
      company_domain: formData.get('companyDomain') as string,
      company_name: formData.get('companyName') as string,
    };

    try {
      setIsSearching(true);
      setError(null);
      setCurrentStep(2);
      
      const response = await findCompany(data);
      
      if (response.status === 'error') {
        setError(response.message);
        setCurrentStep(1);
        setResult(null);
        return;
      }
      
      setResult(response);
      setCurrentStep(3);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find company information. Please try again.';
      setError(errorMessage);
      setCurrentStep(1);
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center">
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
            Company Finder
          </h1>
          <p className="text-[#4B5563] text-base">
            Discover and verify company information. Find accurate business details to enhance your prospecting efforts.
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
              <label htmlFor="companyUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Business Company URL
                <span className="ml-2 text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                name="companyUrl"
                id="companyUrl"
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                placeholder="example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                placeholder="Example Company Inc."
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
                  <Building2 className="w-5 h-5 mr-2" />
                  Find Company
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results section */}
        {result && result.status === 'success' && (
          <div className="mt-6">
            <div className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 border border-emerald-100/60">
              {/* Main company information */}
              <div className="p-4 sm:p-5 border-b border-emerald-100/60 bg-white/90 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  {result.logoResolutionResult && (
                    <div className="flex-shrink-0">
                      <img 
                        src={result.logoResolutionResult} 
                        alt={`${result.companyName} logo`}
                        className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-emerald-600" />
                        {result.companyName}
                      </h3>
                      <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100/80 rounded-full shadow-sm">
                        Found
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-1.5 text-emerald-500" />
                        {result.industry}
                      </div>
                      <a 
                        href={result.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        <Globe className="w-4 h-4 mr-1.5 text-emerald-500" />
                        {result.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-1.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="text-gray-600">
                          {result.headquarter.line1}, {result.headquarter.city}, {result.headquarter.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        <Link className="w-4 h-4 mr-1.5 text-emerald-500" />
                        {result.url.replace(/^https?:\/\//, '')}
                      </a>
                      <div className="flex items-center text-gray-600">
                        <Users2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                        {result.employeeCount.toLocaleString()} employees
                      </div>
                      {result.specialties && result.specialties.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <Award className="w-4 h-4 mr-1.5 text-emerald-500" />
                          {result.specialties.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Organizations section */}
              {result.similarOrganizations && result.similarOrganizations.length > 0 && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-white via-emerald-50/20 to-white">
                  <p className="text-xs font-medium text-gray-500 mb-3 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Similar Organizations
                  </p>
                  <div className="space-y-3 pl-5">
                    {result.similarOrganizations.map((org, index) => (
                      <div 
                        key={index}
                        className="rounded-lg border border-emerald-100/60 overflow-hidden bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="p-3 flex items-start gap-3">
                          {org.logoResolutionResult && (
                            <div className="flex-shrink-0">
                              <img 
                                src={org.logoResolutionResult} 
                                alt={`${org.name} logo`}
                                className="w-12 h-12 object-contain rounded-md border border-gray-100 bg-white"
                              />
                            </div>
                          )}
                          
                          <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {org.name}
                            </h4>
                            <a 
                              href={org.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline block truncate"
                            >
                              {org.url.replace(/^https?:\/\//, '')}
                            </a>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                              <span className="flex items-center">
                                <Briefcase className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" />
                                {org.industry}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" />
                                {org.headquarter.line1}, {org.headquarter.city}, {org.headquarter.country}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center text-gray-600 text-xs">
            <Building2 className="w-4 h-4 mr-1" />
            Powered by SpeakerDrive Company Intelligence
          </div>
        </div>
      </div>
    </div>
  );
}
