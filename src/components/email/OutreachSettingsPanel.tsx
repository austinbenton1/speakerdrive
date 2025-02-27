import React from 'react';
import { MinimalToggle } from '../ui/toggle';
import { services } from '../../utils/constants';
import { useUserProfile } from '../../hooks/useUserProfile';
import {
  Presentation,
  GraduationCap,
  Target,
  Briefcase,
  Users,
  Plus,
  Mail,
  Linkedin,
  FileText,
} from 'lucide-react';

interface OutreachSettingsPanelProps {
  showAdvanced: boolean;
  isPitching: boolean;
  setIsPitching: (value: boolean) => void;

  showMyContext: boolean;
  setShowMyContext: (value: boolean) => void;
  profileOffering?: string;
  profileServicesString?: string;

  selectedService: string;
  setSelectedService: (val: string) => void;

  parseProfileServices: (servicesStr: string | null) => string[];

  outreachChannel: 'email' | 'linkedin' | 'proposal';
  setOutreachChannel: (channel: 'email' | 'linkedin' | 'proposal') => void;

  emailWrittenFrom: 'myself' | 'team';
  setEmailWrittenFrom: (value: 'myself' | 'team') => void;

  linkedinNoteType: 'smart' | 'event';
  setLinkedinNoteType: (value: 'smart' | 'event') => void;

  proposalContentType: 'smart' | 'custom';
  setProposalContentType: (value: 'smart' | 'custom') => void;

  lead: {
    eventName?: string;
    [key: string]: any;
  };
}

/**
 * Compress line breaks and truncate to ~150 characters total.
 * This yields a short snippet with no multi-line paragraphs.
 */
function truncateContextSingleLine(text: string, maxLength = 150): string {
  // Remove all line breaks and extra spaces
  const singleLine = text.replace(/\s*\n\s*/g, ' ').trim();
  if (singleLine.length <= maxLength) {
    return singleLine;
  }
  return singleLine.slice(0, maxLength) + '...';
}

export default function OutreachSettingsPanel({
  showAdvanced,
  isPitching,
  setIsPitching,
  showMyContext,
  setShowMyContext,
  profileOffering,
  profileServicesString,
  selectedService,
  setSelectedService,
  parseProfileServices,
  outreachChannel,
  setOutreachChannel,
  emailWrittenFrom,
  setEmailWrittenFrom,
  linkedinNoteType,
  setLinkedinNoteType,
  proposalContentType,
  setProposalContentType,
  lead,
}: OutreachSettingsPanelProps) {
  const { profile } = useUserProfile();

  // If user turned off advanced, skip entirely
  if (!showAdvanced) return null;

  // Get the user's primary service from profileServicesString
  const primaryService = profileServicesString || '';

  const profileServices = parseProfileServices(profileServicesString || '');
  const truncatedContext = truncateContextSingleLine(profileOffering || '');
  const displayName = profile?.display_name || 'User';

  return (
    <div className="mb-4 pb-4">
      {/* Tier 1: heading (no extra padding) */}
      <p className="text-sm font-medium text-gray-700 mb-3">Outreach Settings</p>

      <div className="space-y-6">
        {/* I'm Pitching toggle */}
        <div>
          {/* Tier 2: Toggle row */}
          <div className="flex items-center gap-2 mb-3 pl-3">
            <MinimalToggle
              className="scale-[0.35] -ml-1"
              label="Position Message For"
              checked={isPitching}
              onChange={(e) => setIsPitching(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-900">
              Position Message For
            </label>
          </div>

          {/* Tier 3: Pitching service buttons */}
          {isPitching && (
            <div className="flex items-center gap-2 flex-wrap pl-6">
              {services.map((service) => {
                const Icon = {
                  Presentation,
                  GraduationCap,
                  Target,
                  Briefcase,
                  Users,
                  Plus,
                }[service.icon];

                const isSelected = selectedService === service.label;
                const isPrimaryService = service.label === primaryService;

                const buttonClasses = [
                  'relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                  'transition-colors duration-200 border',
                  isSelected
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ');

                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.label)}
                    className={buttonClasses}
                  >
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-white' : 'text-gray-500'
                        }`}
                      />
                    )}
                    <span>{service.label}</span>
                    {isPrimaryService && !isSelected && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* My Context toggle */}
        <div className="space-y-3">
          {/* Tier 2: Toggle row */}
          <div className="flex items-center gap-2 pl-3">
            <MinimalToggle
              className="scale-[0.35] mr-1"
              checked={showMyContext}
              onChange={(e) => setShowMyContext(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-900">
              My Profile
            </label>
          </div>

          {/* Tier 3: Context snippet */}
          {showMyContext && (
            <div className="pl-6">
              <p className="text-sm text-gray-600 flex-1 min-w-0">
                {truncatedContext || 'Award-winning keynote speaker...'}
                <a
                  href="/settings/profile?section=bio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline ml-1"
                >
                  Edit
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Email Written From toggle (only show for email channel) */}
        {outreachChannel === 'email' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pl-3">
              <div className="flex items-center gap-2">
                <MinimalToggle
                  checked={emailWrittenFrom === 'myself'}
                  onChange={(e) => setEmailWrittenFrom(e.target.checked ? 'myself' : 'team')}
                />
                <label className="text-sm font-medium text-gray-900">
                  Email Written From
                </label>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 pl-6 flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                {emailWrittenFrom === 'myself' ? 'Myself' : 'My Team/Manager'}
              </span>
              {emailWrittenFrom === 'myself' 
                ? "Written in the First person (e.g., 'I would be excited to contribute…')"
                : `Written in the Third person (e.g., '${displayName} would be a great fit…')`}
            </div>
          </div>
        )}

        {/* LinkedIn Connection Note toggle (only show for linkedin channel) */}
        {outreachChannel === 'linkedin' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pl-3">
              <div className="flex items-center gap-2">
                <MinimalToggle
                  checked={linkedinNoteType === 'smart'}
                  onChange={(e) => setLinkedinNoteType(e.target.checked ? 'smart' : 'event')}
                />
                <label className="text-sm font-medium text-gray-900">
                  LinkedIn Connection Note
                </label>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 pl-6 flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                {linkedinNoteType === 'smart' ? 'Smart Personalization' : 'Event Focused'}
              </span>
              {linkedinNoteType === 'smart' 
                ? 'Crafted for the best fit, with a focus on personalization.'
                : `References ${lead.eventName} in message.`}
            </div>
          </div>
        )}

        {/* Submission Content toggle (only show for proposal channel) */}
        {outreachChannel === 'proposal' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pl-3">
              <div className="flex items-center gap-2">
                <MinimalToggle
                  checked={proposalContentType === 'smart'}
                  onChange={(e) => setProposalContentType(e.target.checked ? 'smart' : 'custom')}
                />
                <label className="text-sm font-medium text-gray-900">
                  Submission Content
                </label>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 pl-6 flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                {proposalContentType === 'smart' ? 'Smart Match' : 'Custom Focus'}
              </span>
              {proposalContentType === 'smart' 
                ? "SpeakerDrive will analyze your expertise against this event's focus and position you as an ideal contributor."
                : `Enter the specific topic or angle for "${lead.eventName}". We'll craft application elements to support this focus.`}
                {proposalContentType === 'custom' && (
                  <textarea
                    className="mt-2 w-full h-24 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 
                    rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-400 resize-none"
                    placeholder="Enter your focus or angle (e.g. 'AI in education' or 'Leadership strategies for tech teams')"
                  />
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
