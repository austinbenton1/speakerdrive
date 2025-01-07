import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LeadDetailHeaderActions from './LeadDetailHeaderActions';
import type { SpeakerLead } from '../../types';

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

  return (
    <div className={`bg-gradient-to-b ${
      lead.leadType === 'Contact' 
        ? 'from-white via-blue-50/20 to-blue-100/10'
        : 'from-white via-emerald-50/20 to-emerald-100/10'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className={`group flex items-center text-sm font-medium text-gray-500 ${
              lead.leadType === 'Contact'
                ? 'hover:text-blue-600'
                : 'hover:text-emerald-600'
            } transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Main Content */}
          <div className="mt-6 flex justify-between items-start gap-8">
            {/* Lead Info */}
            <div className="flex items-start space-x-6 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <img
                  src={lead.image}
                  alt={lead.eventName || lead.name}
                  className={`h-20 w-20 rounded-xl object-cover shadow-lg ${
                    lead.leadType === 'Contact'
                      ? 'ring-4 ring-blue-100/50'
                      : 'ring-4 ring-emerald-100/50'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 leading-tight break-words">
                  {lead.eventName || lead.name}
                </h1>
                {lead.subtext && (
                  <div className="mt-2">
                    <span className="text-lg text-gray-600 leading-normal">{lead.subtext}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
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
    </div>
  );
}