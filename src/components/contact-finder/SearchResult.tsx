import React from 'react';
import { CheckCircle2, XCircle, Mail, Building, User } from 'lucide-react';

interface SearchResultProps {
  result: {
    email: string | null;
    status: string;
    last_name: string;
    first_name: string;
    company_domain: string;
  };
}

export default function SearchResult({ result }: SearchResultProps) {
  const isValid = result.status === 'valid' && result.email;
  
  return (
    <div className={`mt-6 p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-3 w-full">
          <h3 className={`text-sm font-medium ${isValid ? 'text-green-800' : 'text-red-800'}`}>
            {isValid ? 'Email Found!' : 'No Email Found'}
          </h3>
          
          <div className="mt-2 space-y-2">
            {isValid && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium text-green-900">{result.email}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700">
                {result.first_name} {result.last_name}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700">{result.company_domain}</span>
            </div>
          </div>
          
          {!isValid && (
            <p className="mt-2 text-sm text-red-700">
              We couldn't find an email address associated with this person at the specified company.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
