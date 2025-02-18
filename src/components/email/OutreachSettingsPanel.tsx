import React from 'react';
import { MinimalToggle } from '../ui/toggle';
import { services } from '../../utils/constants';
import {
  Presentation,
  GraduationCap,
  Target,
  Briefcase,
  Users,
  Plus,
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

  showCustomization: boolean;
  setShowCustomization: (val: boolean) => void;
  customizationText: string;
  setCustomizationText: (val: string) => void;
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
  showCustomization,
  setShowCustomization,
  customizationText,
  setCustomizationText,
}: OutreachSettingsPanelProps) {
  // If user turned off advanced, skip entirely
  if (!showAdvanced) return null;

  // Get the user's primary service from profileServicesString
  const primaryService = profileServicesString || '';

  const profileServices = parseProfileServices(profileServicesString || '');
  const truncatedContext = truncateContextSingleLine(profileOffering || '');

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      {/* Tier 1: heading (no extra padding) */}
      <p className="text-sm font-medium text-gray-700 mb-3">Outreach Settings</p>

      <div className="space-y-6">
        {/* I'm Pitching toggle */}
        <div>
          {/* Tier 2: Toggle row */}
          <div className="flex items-center gap-2 mb-3 pl-3">
            <MinimalToggle
              className="scale-[0.35] -ml-1"
              checked={isPitching}
              onChange={(e) => setIsPitching(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-900">
              I&apos;m Pitching
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
              My Context
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

        {/* Message Customization toggle */}
        <div>
          {/* Tier 2: Toggle row */}
          <div className="flex items-center gap-2 mb-2 pl-3">
            <MinimalToggle
              className="scale-[0.35] mr-1"
              checked={showCustomization}
              onChange={(e) => setShowCustomization(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-900">
              Message Customization
            </label>
          </div>

          {/* Tier 2: Helper text remains at same level as toggle */}
          <p className="pl-3 text-sm text-gray-600">
            Add override or customization instructions for your outreach message
          </p>

          {/* Tier 3: The text area */}
          {showCustomization && (
            <div className="pl-6 mt-2">
              <textarea
                value={customizationText}
                onChange={(e) => setCustomizationText(e.target.value)}
                placeholder="e.g. 'Focus on sustainability achievements' or 'Emphasize workshop experience'"
                className={`
                  w-full h-24 px-3 py-2 text-sm border border-gray-200 bg-white
                  rounded-lg resize-none
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40
                `}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
