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
    unlockValue?: string;
    info_url?: string;
    infoUrl?: string;
  };
  onClose: () => void;
  outreachChannel?: 'email' | 'linkedin' | 'proposal';
}

export default function EmailComposerHeader({
  lead,
  onClose,
  outreachChannel = 'email'
}: EmailComposerHeaderProps) {
  const isURL = lead.unlockType === 'Unlock Event URL';
  const isContact = lead.leadType === 'Unlock Contact Email';
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
  
  // Get the appropriate value to display based on outreach channel
  const valueToDisplay = outreachChannel === 'linkedin' 
    ? (lead.info_url || lead.infoUrl) 
    : lead.unlockValue;
  
  // Truncate the display value
  const truncatedUnlockValue = valueToDisplay && valueToDisplay.length > 35
    ? `${valueToDisplay.substring(0, 35)}...`
    : valueToDisplay || '';

  // Handle value click
  const handleUnlockValueClick = () => {
    const valueToCopy = outreachChannel === 'linkedin' 
      ? (lead.info_url || lead.infoUrl) 
      : lead.unlockValue;
      
    if (!valueToCopy) return;
    
    // Always copy for LinkedIn outreach, otherwise follow normal behavior
    if (outreachChannel === 'linkedin' || !isURL) {
      navigator.clipboard.writeText(valueToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy: ', err));
    } else {
      window.open(valueToCopy, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative">
      <div
        className={`bg-gradient-to-b ${
          isURL ? 'from-blue-50/30 to-white' : 'from-emerald-50/30 to-white'
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
                  alt={!isContact ? (lead.leadName || lead.lead_name) : lead.eventName}
                  className={`
                    h-16 w-16 rounded-xl object-cover shadow-md
                    ${!isContact ? 'ring-2 ring-blue-100' : 'ring-2 ring-emerald-100'}
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
                      ${outreachChannel === 'linkedin' || !isURL ? 'text-blue-600 hover:text-blue-700' : 'text-green-600 hover:text-green-700'}
                    `}
                    onClick={handleUnlockValueClick}
                  >
                    {copied ? <Check className="h-4 w-4" /> : (outreachChannel === 'linkedin' || !isURL) ? <Copy className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} 
                    {truncatedUnlockValue}
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
