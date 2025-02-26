import React, { useState } from 'react';
import { X, Copy, ExternalLink, Check } from 'lucide-react';

interface EmailComposerHeaderProps {
  lead: {
    leadType: string;
    leadName?: string;
    lead_name?: string;  // some back-ends store name as lead_name
    eventName?: string;
    jobTitle?: string;
    image: string;
    // Must match the name actually passed from parent
    unlockValue?: string; 
  };
  onClose: () => void;
}

export default function EmailComposerHeader({
  lead,
  onClose,
}: EmailComposerHeaderProps) {
  const isContact = lead.leadType === 'Contact';
  const [copied, setCopied] = useState(false);

  // Build the main heading text
  const headerTitle = isContact
    ? `${lead.leadName || lead.lead_name || ''}${
        lead.jobTitle ? `, ${lead.jobTitle}` : ''
      }`
    : lead.eventName || '';

  // Truncate the title to 20 characters
  const truncatedTitle = headerTitle.length > 20 
    ? `${headerTitle.substring(0, 20)}...` 
    : headerTitle;
    
  // Truncate organization to 20 characters
  const truncatedOrganization = lead.organization && lead.organization.length > 30
    ? `${lead.organization.substring(0, 30)}...`
    : lead.organization || '';
  
  // Truncate unlock_value to 20 characters
  const truncatedUnlockValue = lead.unlockValue && lead.unlockValue.length > 35
    ? `${lead.unlockValue.substring(0, 35)}...`
    : lead.unlockValue || '';

  // Handle unlock value click
  const handleUnlockValueClick = () => {
    if (!lead.unlockValue) return;
    
    if (isContact) {
      // Copy to clipboard for Contact type
      navigator.clipboard.writeText(lead.unlockValue)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch(err => console.error('Failed to copy: ', err));
    } else {
      // Open in new tab for URL/Event type
      window.open(lead.unlockValue, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative">
      <div
        className={`bg-gradient-to-b ${
          isContact ? 'from-blue-50/30 to-white' : 'from-emerald-50/30 to-white'
        } border-b border-gray-200`}
      >
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            {/* Left: Image + Title/Subheader */}
            <div className="flex items-start space-x-4 text-left">
              {/* Image */}
              <div className="flex-shrink-0 mr-4 sm:mr-0">
                <img
                  src={lead.image}
                  alt={isContact ? (lead.leadName || lead.lead_name) : lead.eventName}
                  className={`
                    h-16 w-16 rounded-xl object-cover shadow-md
                    ${isContact ? 'ring-2 ring-blue-100' : 'ring-2 ring-emerald-100'}
                  `}
                />
              </div>

              {/* Title + unlockValue (with forced max-width) */}
              <div className="min-w-0 flex-1 max-w-sm">
                {/* Title => up to 2 lines */}
                <h2 className="text-xl font-semibold text-gray-900 leading-6 two-line-clamp break-words text-left">
                  {truncatedTitle}
                </h2>

                {/* Subheader => single line */}
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5 one-line-truncate max-w-sm">
                    {truncatedOrganization}
                  </p>
                  <p 
                    className={`
                      text-sm font-medium flex items-center gap-1.5 one-line-truncate max-w-sm cursor-pointer 
                      ${isContact ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'}
                    `}
                    onClick={handleUnlockValueClick}
                  >
                    {copied ? <Check className="h-4 w-4" /> : isContact ? <Copy className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} {truncatedUnlockValue}
                  </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="
                flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
