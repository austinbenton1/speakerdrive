import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Link } from 'lucide-react';
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

  const minimalLogo = '/path/to/minimal/logo'; // replace with actual path

  return (
    <div className={`bg-gradient-to-b ${
      lead.leadType === 'Contact' 
        ? 'from-white via-blue-50/20 to-blue-100/10'
        : 'from-white via-emerald-50/20 to-emerald-100/10'
    } border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Navigation Controls Container - Same width as Event Snapshot */}
          <div className="max-w-3xl flex items-center justify-between mb-6">
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
            <div className="flex items-center space-x-4">
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

          {/* Main Content */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] gap-8">
            {/* Lead Info */}
            <div className="min-w-0">
              <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm p-6 h-[200px] flex items-center">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={lead.image}
                      alt={lead.lead_name || 'Lead'}
                      className="h-16 w-16 rounded-full object-cover bg-white shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = minimalLogo;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-[28px] font-semibold text-gray-900 leading-tight break-words">
                      {lead.leadType === 'Contact' 
                        ? `${lead.name}${lead.jobTitle ? `, ${lead.jobTitle}` : ''}`
                        : lead.eventName
                      }
                    </h1>
                    <div className="mt-3">
                      <span className="text-xl text-gray-600 leading-normal line-clamp-2">
                        {lead.focus || 'No focus specified'}
                        <span className={`
                          hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium align-middle ml-2
                          ${lead.leadType === 'Contact'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }
                        `}>
                          {lead.leadType === 'Contact' ? (
                            <Mail className="w-3 h-3 mr-1" />
                          ) : (
                            <Link className="w-3 h-3 mr-1" />
                          )}
                          {lead.unlockType.replace(/(Event|Contact)\s*/g, '')}
                        </span>
                      </span>
                      {/* Mobile-only centered pill */}
                      <div className="flex justify-center mt-4 md:hidden">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${lead.leadType === 'Contact'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }
                        `}>
                          {lead.leadType === 'Contact' ? (
                            <Mail className="w-3 h-3 mr-1" />
                          ) : (
                            <Link className="w-3 h-3 mr-1" />
                          )}
                          {lead.unlockType.replace(/(Event|Contact)\s*/g, '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm p-6 h-[200px] space-y-3">
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
    </div>
  );
}