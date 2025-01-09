import React, { useState } from 'react';
import { Phone, AlertCircle } from 'lucide-react';
import StepIndicator from '../components/contact-finder/StepIndicator';

export default function MobileFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mobile finder logic will be implemented later
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
            Mobile Finder
          </h1>
          <p className="text-[#4B5563] text-base">
            Find verified mobile numbers for decision-makers. Connect directly with potential clients.
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
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="John"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Doe"
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
                placeholder="company.com"
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
                  <Phone className="w-5 h-5 mr-2" />
                  Find Mobile Number
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center text-gray-600 text-xs">
            <Phone className="w-4 h-4 mr-1" />
            All mobile numbers are verified in real-time
          </div>
        </div>
      </div>
    </div>
  );
}