import React, { useState } from 'react';
import { Sparkles, Unlock, Check, Copy, Mail, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { formatUnlockType, getUnlockIcon } from '../../utils/formatters';
import { copyToClipboard } from '../../utils/clipboard';
import Toast from '../ui/Toast';
import EmailComposer from '../email/EmailComposer';
import type { SpeakerLead } from '../../types';

interface LeadDetailHeaderActionsProps {
  onCreateColdIntro: () => void;
  onUnlock: () => void;
  isUnlocking: boolean;
  isUnlocked: boolean;
  unlockType: string;
  unlockValue: string | null;
  lead: SpeakerLead;
}

export default function LeadDetailHeaderActions({
  onCreateColdIntro,
  onUnlock,
  isUnlocking,
  isUnlocked,
  unlockType,
  unlockValue,
  lead
}: LeadDetailHeaderActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  const truncateValue = (value: string) => {
    if (!value) return '';
    
    // For URLs, show just the domain
    if (unlockType.toLowerCase().includes('url')) {
      try {
        const url = new URL(value);
        return url.hostname;
      } catch {
        return value.length > 25 ? value.slice(0, 22) + '...' : value;
      }
    }
    
    // For emails, show the full value if it's short enough
    if (value.length <= 25) return value;
    
    // For longer emails, truncate while preserving the @ symbol
    const atIndex = value.indexOf('@');
    if (atIndex > -1) {
      const username = value.slice(0, atIndex);
      const domain = value.slice(atIndex);
      if (username.length > 15) {
        return username.slice(0, 12) + '...' + domain;
      }
    }
    
    return value.slice(0, 22) + '...';
  };

  const handleUnlockClick = async () => {
    if (isUnlocked && unlockValue) {
      if (unlockType.toLowerCase().includes('url')) {
        window.open(unlockValue, '_blank', 'noopener,noreferrer');
      } else {
        try {
          await copyToClipboard(unlockValue);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          setToastMessage('Copied to clipboard!');
          setToastType('success');
          setShowToast(true);
        } catch {
          setCopyError(true);
          setTimeout(() => setCopyError(false), 2000);
          setToastMessage('Failed to copy to clipboard');
          setToastType('error');
          setShowToast(true);
        }
      }
    } else {
      onUnlock();
    }
  };

  const UnlockIcon = isUnlocked ? (unlockType.toLowerCase().includes('url') ? LinkIcon : Mail) : Unlock;

  const getUnlockLabel = () => {
    if (isUnlocking) return 'Unlocking...';
    if (!isUnlocked) return formatUnlockType(unlockType);
    if (!unlockValue) return 'Unlocked';
    
    // For Event URLs, show the truncated URL
    if (unlockType.toLowerCase().includes('url')) {
      try {
        const url = new URL(unlockValue);
        // Show domain and first part of path if it exists
        const path = url.pathname === '/' ? '' : url.pathname.split('/')[1];
        return `${url.hostname}${path ? '/' + path : ''}`;
      } catch {
        return truncateValue(unlockValue);
      }
    }
    
    // For emails, show the full value
    return unlockValue;
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEmailComposer(true)}
          disabled={!isUnlocked}
          className="h-10 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 bg-[#00B341]/10 text-[#00B341] border border-[#00B341]/20 hover:bg-[#00B341]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
          Create Outreach
        </button>

        <button
          onClick={handleUnlockClick}
          disabled={isUnlocking}
          className={`h-10 px-4 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-50 text-green-600 border border-green-200'
              : copyError
              ? 'bg-red-50 text-red-600 border border-red-200'
              : isUnlocked
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-[#0066FF] text-white border border-[#0066FF] hover:bg-[#0052CC]'
          } disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
          title={unlockValue || undefined}
        >
          <UnlockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{getUnlockLabel()}</span>
          {isUnlocked && unlockValue && (
            unlockType === 'Event URL' || unlockType === 'Unlock Event URL' ? (
              <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0 text-gray-400" />
            ) : (
              <Copy className={`w-4 h-4 ml-2 flex-shrink-0 ${copied ? 'text-green-500' : 'text-gray-400'}`} />
            )
          )}
        </button>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <EmailComposer
        lead={lead}
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
      />
    </>
  );
}