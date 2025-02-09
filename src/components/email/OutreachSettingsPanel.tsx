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
  MoreHorizontal,
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

  showAdditionalServices: boolean;
  setShowAdditionalServices: (val: boolean) => void;

  parseProfileServices: (servicesStr: string | null) => string[];

  messageFormat: 'concise' | 'expanded';
  setMessageFormat: (val: 'concise' | 'expanded') => void;

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
  showAdditionalServices,
  setShowAdditionalServices,
  parseProfileServices,
  messageFormat,
  setMessageFormat,
  showCustomization,
  setShowCustomization,
  customizationText,
  setCustomizationText,
}: OutreachSettingsPanelProps) {
  // If user turned off advanced, skip
  if (!showAdvanced) return null;

  const profileServices = parseProfileServices(profileServicesString || '');

  // Convert multi-paragraph “offering” to a single line, max ~150 chars
  const truncatedContext = truncateContextSingleLine(profileOffering || '');

  return (
    <div className="bg-white p-4">
      <div className="bg-white rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Outreach Settings
        </p>
        <div className="space-y-6 px-3">
          {/* I'm Pitching toggle + service selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MinimalToggle
                className="scale-[0.35] -ml-1"
                checked={isPitching}
                onChange={(e) => setIsPitching(e.target.checked)}
              />
              <label className="text-sm font-medium text-gray-900">
                I&apos;m Pitching
              </label>
            </div>
            {isPitching && (
              <div className="flex items-center gap-2">
                {services.slice(0, 3).map((service) => {
                  const Icon = {
                    Presentation,
                    GraduationCap,
                    Target,
                    Briefcase,
                    Users,
                    Plus,
                  }[service.icon];

                  const isInProfile = profileServices.includes(service.id);
                  const isSelected = selectedService === service.id;

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
                      onClick={() => setSelectedService(service.id)}
                      className={buttonClasses}
                    >
                      {Icon && (
                        <Icon
                          className={
                            isSelected ? 'w-3 h-3 text-white' : 'w-3 h-3 text-gray-500'
                          }
                        />
                      )}
                      {service.label}
                      {isInProfile && (
                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                  );
                })}

                {/* More... services */}
                <div
                  className="relative"
                  onClick={() => setShowAdditionalServices(!showAdditionalServices)}
                >
                  <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
            {isPitching && showAdditionalServices && (
              <div className="flex gap-2 mt-2">
                {services.slice(3).map((service) => {
                  const Icon = {
                    Presentation,
                    GraduationCap,
                    Target,
                    Briefcase,
                    Users,
                    Plus,
                  }[service.icon];

                  const isInProfile = profileServices.includes(service.id);
                  const isSelected = selectedService === service.id;

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
                      onClick={() => setSelectedService(service.id)}
                      className={buttonClasses}
                    >
                      {Icon && (
                        <Icon
                          className={
                            isSelected ? 'w-3 h-3 text-white' : 'w-3 h-3 text-gray-500'
                          }
                        />
                      )}
                      {service.label}
                      {isInProfile && (
                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Context toggle, truncated to ~150 chars / single line */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MinimalToggle
                className="scale-[0.35] mr-1"
                checked={showMyContext}
                onChange={(e) => setShowMyContext(e.target.checked)}
              />
              <label className="text-sm font-medium text-gray-900">
                My Context
              </label>
            </div>
            {showMyContext && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 flex-1 min-w-0">
                  {/* Single line, truncated snippet */}
                  {truncatedContext || 'Award-winning keynote speaker...'}
                  <a
                    href="/settings"
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

          {/* Message Format toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-900">
                Message Format
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMessageFormat('concise')}
                className={`
                  relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                  transition-colors duration-200 border
                  ${
                    messageFormat === 'concise'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                Concise
                {messageFormat === 'concise' && (
                  <span className="text-yellow-500 ml-1.5 hover:scale-110 transition-transform">
                    ✨
                  </span>
                )}
              </button>
              <button
                onClick={() => setMessageFormat('expanded')}
                className={`
                  relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                  transition-colors duration-200 border
                  ${
                    messageFormat === 'expanded'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                Expanded
              </button>
              <div className="flex gap-2 text-xs text-gray-500">
                {messageFormat === 'concise' && (
                  <div className="flex items-center gap-1 ml-2">
                    <span>Recommended</span>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 hover:underline ml-1"
                    >
                      Learn more
                    </a>
                  </div>
                )}
                {messageFormat === 'expanded' && (
                  <div className="ml-[82px]">
                    <span>More detailed message</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Customization instructions */}
          <div className="pb-2">
            <div className="flex items-center gap-2 mb-2">
              <MinimalToggle
                className="scale-[0.35] mr-1"
                checked={showCustomization}
                onChange={(e) => setShowCustomization(e.target.checked)}
              />
              <label className="text-sm font-medium text-gray-900">
                Message Customization
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Add override or customization instructions for your outreach message
            </p>
            {showCustomization && (
              <textarea
                value={customizationText}
                onChange={(e) => setCustomizationText(e.target.value)}
                placeholder="e.g. 'Focus on sustainability achievements' or 'Emphasize workshop experience'"
                className={`
                  w-full h-24 px-3 py-2 text-sm border border-gray-200 bg-white
                  rounded-lg resize-none mt-2
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40
                `}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
