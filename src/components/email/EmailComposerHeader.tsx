import React from 'react';
import { X } from 'lucide-react';

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

  // Build the main heading text
  const headerTitle = isContact
    ? `${lead.leadName || lead.lead_name || ''}${
        lead.jobTitle ? `, ${lead.jobTitle}` : ''
      }`
    : lead.eventName || '';

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
                  {headerTitle}
                </h2>

                {/* Subheader => single line */}
                {lead.unlockValue && (
                  <p className="mt-1 text-base font-medium text-gray-600 flex items-center gap-1.5 one-line-truncate max-w-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {lead.unlockValue}
                  </p>
                )}
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
