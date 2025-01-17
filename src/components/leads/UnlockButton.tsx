import React from 'react';
import { Mail, Link as LinkIcon, Loader, ExternalLink } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface UnlockButtonProps {
  type: string;
  isLoading: boolean;
  isUnlocked: boolean;
  unlockValue: string | null;
  onClick?: () => void;
}

export default function UnlockButton({ type, isLoading, isUnlocked, unlockValue, onClick }: UnlockButtonProps) {
  const baseButtonClasses = `
    inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-medium text-white
    transition-all duration-300 shadow-sm hover:shadow-md
    transform hover:-translate-y-[1px]
  `;

  const buttonClasses = isUnlocked
    ? `${baseButtonClasses} bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
       border border-emerald-400/20`
    : type === 'Contact Email' || type === 'Unlock Contact Email'
      ? `${baseButtonClasses} bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#004099]
         border border-blue-400/20`
      : `${baseButtonClasses} bg-gradient-to-r from-[#00B341] to-[#009938] hover:from-[#009938] hover:to-[#008530]
         border border-green-400/20`;

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname === '/' ? '' : urlObj.pathname.split('/')[1];
      return `${urlObj.hostname}${path ? '/' + path : ''}`;
    } catch {
      return url;
    }
  };

  const getTooltipContent = () => {
    if (type === 'Contact Email' || type === 'Unlock Contact Email') {
      return (
        <div className="space-y-2">
          <p className="font-semibold">Contact Email →</p>
          <p className="text-gray-200">Direct email addresses of decision makers and event organizers</p>
        </div>
      );
    }
    if (type === 'Event Email' || type === 'Unlock Event Email') {
      return (
        <div className="space-y-2">
          <p className="font-semibold">Event Email →</p>
          <p className="text-gray-200">Company Email addresses (events@..., info@..., etc)</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <p className="font-semibold">Event URL →</p>
        <p className="text-gray-200">Website links (Call For Speakers Forms, Website Contact Pages, etc)</p>
      </div>
    );
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <button 
        onClick={onClick}
        disabled={isLoading}
        className={`${buttonClasses} disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
        title={isUnlocked && unlockValue ? unlockValue : undefined}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin opacity-90" />
            Unlocking...
          </>
        ) : (
          <>
            {(type === 'Contact Email' || type === 'Unlock Contact Email') && (
              <>
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {isUnlocked ? unlockValue || 'Contact Email Unlocked' : 'Unlock Contact Email'}
              </>
            )}
            {(type === 'Event Email' || type === 'Unlock Event Email') && (
              <>
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {isUnlocked ? unlockValue || 'Event Email Unlocked' : 'Unlock Event Email'}
              </>
            )}
            {(type === 'Event URL' || type === 'Unlock Event URL') && (
              <>
                <LinkIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {isUnlocked ? (unlockValue ? formatUrl(unlockValue) : 'Event URL Unlocked') : 'Unlock Event URL'}
                {isUnlocked && unlockValue && (
                  <ExternalLink className="w-4 h-4 ml-2 text-white/80 group-hover:text-white transition-opacity" />
                )}
              </>
            )}
          </>
        )}
      </button>
    </Tooltip>
  );
}