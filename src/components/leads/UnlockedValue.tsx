import React, { useState } from 'react';
import { Mail, Link as LinkIcon, Copy, ExternalLink, Check } from 'lucide-react';

interface UnlockedValueProps {
  type: string;
  value: string | null | undefined;
}

export default function UnlockedValue({ type, value }: UnlockedValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!value) return null;

  if (type === 'Contact Email' || type === 'Event Email') {
    return (
      <div className="flex items-center space-x-2 px-4 py-2.5 bg-[#00B341]/5 border border-[#00B341]/10 rounded-lg">
        <Mail className="w-4 h-4 text-[#00B341]" />
        <span className="text-sm text-gray-700">{value}</span>
        <button
          onClick={() => handleCopy(value)}
          className="p-1 text-[#00B341] hover:text-[#009938] rounded-md hover:bg-[#00B341]/10"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  if (type === 'Event URL') {
    return (
      <div className="flex items-center space-x-2 px-4 py-2.5 bg-[#0066FF]/5 border border-[#0066FF]/10 rounded-lg">
        <LinkIcon className="w-4 h-4 text-[#0066FF]" />
        <span className="text-sm text-gray-700 truncate max-w-[200px]">
          {value}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(value)}
            className="p-1 text-[#0066FF] hover:text-[#0052CC] rounded-md hover:bg-[#0066FF]/10"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-[#0066FF] hover:text-[#0052CC] rounded-md hover:bg-[#0066FF]/10"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}