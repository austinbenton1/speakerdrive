import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Linkedin, Globe2 } from 'lucide-react';
import type { SpeakerLead } from '../../types';
import LeadDetailHeaderActions from './LeadDetailHeaderActions';

interface LeadDetailHeaderProps {
  lead: SpeakerLead;
  onUnlock: () => void;
  isUnlocking: boolean;
  isUnlocked: boolean;
  unlockValue: string | null;
}

export default function LeadDetailHeader({ 
  lead,
  onUnlock,
  isUnlocking,
  isUnlocked,
  unlockValue
}: LeadDetailHeaderProps) {
  const navigate = useNavigate();

  const handleInfoUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-[#0066FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Lead Header Content */}
          <div className="mt-8 flex items-center justify-between">
            {/* Lead Info */}
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={lead.image}
                  alt={lead.name}
                  className="h-20 w-20 rounded-xl object-cover ring-2 ring-gray-100 shadow-sm"
                />
              </div>
              <div className="ml-8">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {lead.name}
                  </h1>
                  {lead.infoUrl && (
                    <button
                      onClick={() => handleInfoUrlClick(lead.infoUrl!)}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      title={lead.leadType === 'Contact' ? 'View LinkedIn Profile' : 'View Website'}
                    >
                      {lead.leadType === 'Contact' ? (
                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                      ) : (
                        <Globe2 className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{lead.focus}</span>
                  <span className="text-gray-200">•</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0066FF]/5 text-[#0066FF] border border-[#0066FF]/10">
                    {lead.leadType}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <LeadDetailHeaderActions
              onCreateColdIntro={() => {}}
              onUnlock={onUnlock}
              isUnlocking={isUnlocking}
              isUnlocked={isUnlocked}
              unlockType={lead.unlockType}
              unlockValue={unlockValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}