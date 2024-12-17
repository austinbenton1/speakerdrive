import React from 'react';
import { Mail, Link as LinkIcon, Loader } from 'lucide-react';

interface UnlockButtonProps {
  type: string;
  isLoading: boolean;
}

export default function UnlockButton({ type, isLoading }: UnlockButtonProps) {
  return (
    <button 
      disabled={isLoading}
      className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] transition-all duration-200 disabled:opacity-75"
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
              Unlock Contact Email
            </>
          )}
          {type === 'Event Email' && (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Unlock Event Email
            </>
          )}
          {type === 'Event URL' && (
            <>
              <LinkIcon className="w-4 h-4 mr-2" />
              Unlock Event URL
            </>
          )}
        </>
      )}
    </button>
  );
}