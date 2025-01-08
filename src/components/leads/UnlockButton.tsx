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

  if (isUnlocked && type === 'Event URL' && unlockValue) {
    return (
      <a 
        href={unlockValue}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Visit Event Page
      </a>
    );
  }

  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={`${buttonClasses} disabled:opacity-75`}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Unlocking...
        </>
      ) : (
        <>
          {type === 'Contact Email' && (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {isUnlocked ? 'Contact Email Unlocked' : 'Unlock Contact Email'}
            </>
          )}
          {type === 'Event Email' && (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {isUnlocked ? 'Event Email Unlocked' : 'Unlock Event Email'}
            </>
          )}
          {type === 'Event URL' && (
            <>
              <LinkIcon className="w-4 h-4 mr-2" />
              {isUnlocked ? 'Event URL Unlocked' : 'Unlock Event URL'}
            </>
          )}
        </>
      )}
    </button>
  );
}