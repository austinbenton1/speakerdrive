import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LinkedinIcon, 
  Globe, 
  ExternalLink
} from 'lucide-react';
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
    <div className={`bg-gradient-to-b ${
      lead.leadType === 'Contact' 
        ? 'from-white via-blue-50/20 to-blue-100/10'
        : 'from-white via-emerald-50/20 to-emerald-100/10'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
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

          {/* Lead Header Content */}
          <div className="mt-8 flex items-center justify-between">
            {/* Lead Info */}
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={lead.image}
                  alt={lead.name}
                  className={`h-20 w-20 rounded-xl object-cover ring-4 ring-white shadow-lg ${
                    lead.leadType === 'Contact'
                      ? 'ring-blue-100/50'
                      : 'ring-emerald-100/50'
                  }`}
                />
                <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
                  lead.leadType === 'Contact'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-blue-100'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-2 ring-emerald-100'
                }`}>
                  {lead.leadType}
                </span>
              </div>
              <div className="ml-8">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {lead.name}
                  </h1>
                  {lead.infoUrl && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleInfoUrlClick(lead.infoUrl!)}
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                          lead.leadType === 'Contact'
                            ? 'text-blue-600 hover:bg-blue-100/50'
                            : 'text-emerald-600 hover:bg-emerald-100/50'
                        }`}
                        title={lead.leadType === 'Contact' ? 'View LinkedIn Profile' : 'View Website'}
                      >
                        {lead.leadType === 'Contact' ? (
                          <>
                            <LinkedinIcon className="w-4 h-4" />
                            <span className="text-sm">LinkedIn</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            <span className="text-sm">Website</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">{lead.focus}</span>
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