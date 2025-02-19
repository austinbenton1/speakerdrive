import React, { useState, useRef } from 'react';
import { UserCog, AlertCircle, Users2 } from 'lucide-react';

// Add API function
const LEADMAGIC_API_KEY = '4f18d12a98720d1af9b86d90d568f405';

const searchProfile = async (data: { profile_url: string }) => {
  try {
    const response = await fetch('https://api.leadmagic.io/profile-search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': LEADMAGIC_API_KEY
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search profile');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

const ProfileFinder: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    
    const formData = new FormData(e.currentTarget);
    const profileUrl = formData.get('profileUrl') as string;

    try {
      setIsSearching(true);
      setError(null);
      setCurrentStep(2);
      
      const response = await searchProfile({ profile_url: profileUrl });
      
      if (response.status === 'error') {
        setError(response.message);
        setCurrentStep(1);
        setResult(null);
        return;
      }
      
      setResult(response);
      setCurrentStep(3);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search profile. Please try again.';
      setError(errorMessage);
      setCurrentStep(1);
      setResult(null);
    } finally {
      setIsSearching(false);
      isSubmitting.current = false;
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
            Profile Finder
          </h1>
          <p className="text-[#4B5563] text-base">
            Discover and explore professional profiles by their URL.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-4">
            {[
              { number: 1, label: 'Enter Details' },
              { number: 2, label: 'Processing' },
              { number: 3, label: 'Results' }
            ].map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <React.Fragment key={step.number}>
                  {index > 0 && (
                    <div 
                      className={`h-0.5 w-12 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <div 
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center 
                        ${
                          isCompleted 
                            ? 'bg-emerald-500 text-white' 
                            : isCurrent 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {step.number}
                    </div>
                    <span className={`
                      text-xs mt-1 
                      ${
                        isCompleted 
                          ? 'text-emerald-600' 
                          : isCurrent 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }
                    `}>
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
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
              <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Profile URL
              </label>
              <input
                type="url"
                name="profileUrl"
                id="profileUrl"
                defaultValue="https://www.linkedin.com/in/williamhgates"
                placeholder="https://linkedin.com/in/username"
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
                  <Users2 className="w-5 h-5 mr-2" />
                  Search Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results section */}
        {result && (
          <div className="mt-6">
            {result.profileUrl ? (
              <div className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-blue-200 border border-blue-300">
                {/* Profile Header */}
                <div className="p-6 border-b border-blue-200 bg-white/70 backdrop-blur-sm">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="relative">
                      <img 
                        src={result.profilePic} 
                        alt={result.fullName}
                        className="w-24 h-24 rounded-xl border-2 border-white shadow-lg object-cover"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                        {result.connections} connections
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{result.fullName}</h2>
                          <p className="text-blue-600 font-medium mt-1">{result.headline}</p>
                        </div>
                        <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
                          <Users2 className="w-4 h-4 text-blue-500 mr-1.5" />
                          <span className="text-sm font-medium text-blue-700">{result.followers?.toLocaleString()} followers</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{result.location}</span>
                        </div>
                        {result.country && (
                          <>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm">{result.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {result.about && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.about}</p>
                    </div>
                  )}
                </div>

                {/* Company Information */}
                {result.company_name && (
                  <div className="p-6 bg-white/70 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Company</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Company:</span> {result.company_name}
                      </p>
                      {result.company_industry && (
                        <p className="text-sm">
                          <span className="font-medium">Industry:</span> {result.company_industry}
                        </p>
                      )}
                      {result.company_size && (
                        <p className="text-sm">
                          <span className="font-medium">Size:</span> {result.company_size}
                        </p>
                      )}
                      {result.company_website && (
                        <p className="text-sm">
                          <span className="font-medium">Website:</span>{' '}
                          <a 
                            href={`https://${result.company_website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {result.company_website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                {result.experiences && result.experiences.length > 0 && (
                  <div className="p-6 bg-white/70 backdrop-blur-sm border-t border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Experience</h3>
                    <div className="space-y-4">
                      {result.experiences.map((exp, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          {exp.logo && (
                            <img 
                              src={exp.logo} 
                              alt={exp.subtitle}
                              className="w-12 h-12 rounded border border-gray-200"
                            />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-600">{exp.subtitle}</p>
                            <p className="text-xs text-gray-500 mt-1">{exp.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl shadow-sm border border-blue-300 p-6 bg-blue-200/70 backdrop-blur-sm text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Profile Found</h3>
                <p className="text-gray-500 mt-1">
                  We couldn't find any profile information for the provided URL.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFinder;
