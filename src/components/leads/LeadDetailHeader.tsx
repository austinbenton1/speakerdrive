import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LeadDetailHeaderActions from './LeadDetailHeaderActions';
import type { SpeakerLead } from '../../types';

interface LeadDetailHeaderProps {
  lead: SpeakerLead;
  onUnlock: () => void;
  isUnlocking: boolean;
  isUnlocked: boolean;
  unlockValue: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function LeadDetailHeader({ 
  lead,
  onUnlock,
  isUnlocking,
  isUnlocked,
  unlockValue,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: LeadDetailHeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const handleBack = () => {
    const state = location.state as { 
      fromFindLeads?: boolean; 
      fromUnlockedLeads?: boolean;
      returnPath?: string;
      filters?: any;
    };

    if (state?.returnPath) {
      // Preserve filters when returning
      navigate(state.returnPath, {
        state: { preservedFilters: state.filters }
      });
    } else if (state?.fromFindLeads) {
      navigate(`/find-leads?${searchParams.toString()}`);
    } else if (state?.fromUnlockedLeads) {
      navigate('/leads');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-gradient-to-b ${
      lead.leadType === 'Contact' 
        ? 'from-white via-blue-50/20 to-blue-100/10'
        : 'from-white via-emerald-50/20 to-emerald-100/10'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Navigation Controls Container - Same width as Event Snapshot */}
          <div className="max-w-3xl">
            <div className="flex justify-between items-center">
              {/* Back Button */}
              <button 
                onClick={handleBack}
                className={`group flex items-center text-sm font-medium text-gray-500 ${
                  lead.leadType === 'Contact'
                    ? 'hover:text-blue-600'
                    : 'hover:text-emerald-600'
                } transition-colors`}
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>

              {/* Previous/Next Navigation */}
              <div className="flex space-x-4 items-center">
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className={`group flex items-center text-sm font-medium text-gray-500 ${
                    lead.leadType === 'Contact'
                      ? 'hover:text-blue-600'
                      : 'hover:text-emerald-600'
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Previous
                </button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={`group flex items-center text-sm font-medium text-gray-500 ${
                    lead.leadType === 'Contact'
                      ? 'hover:text-blue-600'
                      : 'hover:text-emerald-600'
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

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
                lead={lead}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}