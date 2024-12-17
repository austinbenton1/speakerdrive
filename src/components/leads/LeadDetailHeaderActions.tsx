import React, { useState } from 'react';
import { Sparkles, Unlock, Check } from 'lucide-react';
import { formatUnlockType, getUnlockIcon } from '../../utils/formatters';
import { copyToClipboard } from '../../utils/clipboard';

interface LeadDetailHeaderActionsProps {
  onCreateColdIntro: () => void;
  onUnlock: () => void;
  isUnlocking: boolean;
  isUnlocked: boolean;
  unlockType: string;
  unlockValue: string | null;
}

export default function LeadDetailHeaderActions({
  onCreateColdIntro,
  onUnlock,
  isUnlocking,
  isUnlocked,
  unlockType,
  unlockValue
}: LeadDetailHeaderActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Get button label based on state
  const getUnlockLabel = () => {
    if (isUnlocking) return 'Unlocking...';
    if (copied) return 'Copied!';
    if (copyError) return 'Copy failed';
    if (isUnlocked && unlockValue) return unlockValue;
    return formatUnlockType(unlockType);
  };

  // Get button styles based on state
  const getUnlockButtonStyles = () => {
    if (copied) {
      return "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-green-600 transition-all duration-200 bg-green-50 border border-green-200 hover:bg-green-100";
    }
    if (copyError) {
      return "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 transition-all duration-200 bg-red-50 border border-red-200 hover:bg-red-100";
    }
    if (isUnlocked) {
      return "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 transition-all duration-200 bg-blue-50 border border-blue-200 hover:bg-blue-100";
    }
    return "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 bg-[#0066FF] border border-[#0066FF] hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed";
  };

  // Handle unlock button click
  const handleUnlockClick = async () => {
    if (!isUnlocked) {
      onUnlock();
      return;
    }

    // If already unlocked, copy value to clipboard
    if (unlockValue) {
      const success = await copyToClipboard(unlockValue);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } else {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      }
    }
  };

  // Get the appropriate icon based on state
  const getButtonIcon = () => {
    if (copied) return Check;
    if (isUnlocked) return getUnlockIcon(unlockType);
    return Unlock;
  };

  const ButtonIcon = getButtonIcon();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onCreateColdIntro}
        disabled={!isUnlocked}
        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[#00B341]/10 text-[#00B341] border border-[#00B341]/20 hover:bg-[#00B341]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Create Cold Intro
      </button>

      <button
        onClick={handleUnlockClick}
        disabled={isUnlocking}
        className={getUnlockButtonStyles()}
      >
        <ButtonIcon className="w-4 h-4 mr-2" />
        {getUnlockLabel()}
      </button>
    </div>
  );
}