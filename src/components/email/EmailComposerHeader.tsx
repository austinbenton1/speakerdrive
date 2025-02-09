import React from 'react';
import { X } from 'lucide-react';

interface EmailComposerHeaderProps {
  lead: {
    leadType: string;
    leadName?: string;   // e.g. "Mary Ransier"
    lead_name?: string;  // in some cases might be stored as lead_name
    eventName?: string;
    jobTitle?: string;
    image: string;
    focus?: string;
    unlockType?: string; // e.g. "Unlock Contact Email"
  };
  onClose: () => void;
  truncateText: (text: string, maxLength: number) => string;
}

export default function EmailComposerHeader({ lead, onClose, truncateText }: EmailComposerHeaderProps) {
  // If this is a contact, show the contact's name + job title.
  // Otherwise (it's an event), show the eventName.
  const isContact =
    lead.leadType === 'Contact' || lead.unlockType === 'Unlock Contact Email';

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
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={lead.image}
                  alt={isContact ? (lead.leadName || lead.lead_name) : lead.eventName}
                  className={`h-16 w-16 rounded-xl object-cover shadow-md ${
                    isContact
                      ? 'ring-2 ring-blue-100'
                      : 'ring-2 ring-emerald-100'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-gray-900 leading-6 break-words">
                  {truncateText(headerTitle, 30)}
                </h2>
                {lead.focus && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-500">
                      {lead.focus}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
