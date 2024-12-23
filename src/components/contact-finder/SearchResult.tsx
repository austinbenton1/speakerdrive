import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react';

interface SearchResultProps {
  email: string;
  status: 'success' | 'error' | 'warning' | 'catch_all' | 'valid' | 'not_found';
  message: string;
  firstName: string;
  lastName: string;
  companyDomain: string;
}

export default function SearchResult({ 
  email, 
  status,
  message,
  firstName, 
  lastName, 
  companyDomain 
}: SearchResultProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'valid':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          messageStyle: {
            textColor: 'text-green-700',
            bgColor: 'bg-green-50'
          },
          badge: 'Valid'
        };
      case 'catch_all':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          messageStyle: {
            textColor: 'text-yellow-700',
            bgColor: 'bg-yellow-50'
          },
          badge: 'Catch-all'
        };
      case 'error':
      case 'not_found':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          messageStyle: {
            textColor: 'text-red-700',
            bgColor: 'bg-red-50'
          },
          badge: 'Not Found'
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-gray-500" />,
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          messageStyle: {
            textColor: 'text-gray-700',
            bgColor: 'bg-gray-50'
          },
          badge: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border p-6 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {statusConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.messageStyle.bgColor} ${statusConfig.messageStyle.textColor}`}>
              {status === 'catch_all' 
                ? "Email found successfully, but reliability cannot be verified."
                : message}
            </span>
          </div>
          {email && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Mail className={`w-4 h-4 ${statusConfig.textColor}`} />
                <p className="text-sm text-gray-600">
                  Email: <span className={`font-semibold ${statusConfig.textColor}`}>{email}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Domain:</span> {companyDomain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}