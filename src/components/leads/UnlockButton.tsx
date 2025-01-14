import React from 'react';
import { Mail, Link as LinkIcon, Loader, ExternalLink } from 'lucide-react';

interface UnlockButtonProps {
  type: string;
  isLoading: boolean;
  isUnlocked: boolean;
  unlockValue: string | null;
  onClick?: () => void;
}

export default function UnlockButton({ type, isLoading, isUnlocked, unlockValue, onClick }: UnlockButtonProps) {
  const baseButtonClasses = "inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200";
  const buttonClasses = isUnlocked 
    ? `${baseButtonClasses} bg-green-600 hover:bg-green-700` 
    : `${baseButtonClasses} bg-[#0066FF] hover:bg-[#0052CC]`;

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname === '/' ? '' : urlObj.pathname.split('/')[1];
      return `${urlObj.hostname}${path ? '/' + path : ''}`;
    } catch {
      return url;
    }
  };

  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={`${buttonClasses} disabled:opacity-75`}
      title={isUnlocked && unlockValue ? unlockValue : undefined}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Unlocking...
        </>
      ) : (
        <>
          {(type === 'Contact Email' || type === 'Unlock Contact Email') && (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {isUnlocked ? unlockValue || 'Contact Email Unlocked' : 'Unlock Contact Email'}
            </>
          )}
          {(type === 'Event Email' || type === 'Unlock Event Email') && (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {isUnlocked ? unlockValue || 'Event Email Unlocked' : 'Unlock Event Email'}
            </>
          )}
          {(type === 'Event URL' || type === 'Unlock Event URL') && (
            <>
              <LinkIcon className="w-4 h-4 mr-2" />
              {isUnlocked ? (unlockValue ? formatUrl(unlockValue) : 'Event URL Unlocked') : 'Unlock Event URL'}
              {isUnlocked && unlockValue && (
                <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </>
          )}
        </>
      )}
    </button>
  );
}