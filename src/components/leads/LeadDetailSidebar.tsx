import React from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Building, 
  Presentation, 
  GraduationCap,
  HelpCircle,
  ExternalLink,
  Link
} from 'lucide-react';
import { useLeadUnlock } from '../../hooks/useLeadUnlock';
import { formatUnlockType } from '../../utils/formatters';
import type { SpeakerLead } from '../../types';

interface LeadDetailSidebarProps {
  lead: SpeakerLead;
}

interface QuickInfoItem {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  tooltip?: string;
  show: boolean;
  onClick?: () => void;
  isLink?: boolean;
}

export default function LeadDetailSidebar({ lead }: LeadDetailSidebarProps) {
  const { isUnlocked, unlockValue } = useLeadUnlock(lead.id);

  const quickInfoItems: QuickInfoItem[] = [
    {
      icon: Presentation,
      label: 'Event Name',
      value: lead.eventName,
      tooltip: lead.tooltipEventName,
      show: !!lead.eventName,
    },
    {
      icon: Link,
      label: 'Event Link',
      value: 'View Event',
      tooltip: 'Click to visit the event page',
      show: !!lead.eventUrl,
      onClick: () => lead.eventUrl && window.open(lead.eventUrl, '_blank', 'noopener,noreferrer'),
      isLink: true
    },
    {
      icon: Building2,
      label: 'Event Category',
      value: lead.industryCategory,
      tooltip: lead.tooltipIndustryCategory,
      show: true,
    },
    {
      icon: Presentation,
      label: 'Event Format',
      value: lead.eventFormat,
      tooltip: lead.tooltipEventFormat,
      show: !!lead.eventFormat,
    },
    {
      icon: MapPin,
      label: 'Event Location',
      value: lead.location,
      tooltip: lead.tooltipLocation,
      show: !!lead.location,
    },
  ];

  const organizationItems: QuickInfoItem[] = [
    {
      icon: Building,
      label: 'Host Organization',
      value: lead.organization || 'Not specified',
      tooltip: lead.tooltipOrganization,
      show: true,
    },
    {
      icon: Building2,
      label: 'Host Organization Type',
      value: lead.organizationType || 'Not specified',
      tooltip: lead.tooltipOrganizationType,
      show: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Quick Information
          </h3>
          <div className="space-y-4">
            {quickInfoItems
              .filter(item => item.show)
              .map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <item.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-grow">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.isLink ? (
                        <button
                          onClick={item.onClick}
                          className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                        >
                          {item.value}
                        </button>
                      ) : (
                        <span className="text-gray-900">{item.value}</span>
                      )}
                      {item.tooltip && (
                        <div className="relative group">
                          <button className="w-4 h-4 text-gray-400">
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                            {item.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Organization Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Organization Information
          </h3>
          <div className="space-y-4">
            {organizationItems
              .filter(item => item.show)
              .map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <item.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-grow">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.isLink ? (
                        <button
                          onClick={item.onClick}
                          className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                        >
                          {item.value}
                        </button>
                      ) : (
                        <span className="text-gray-900">{item.value}</span>
                      )}
                      {item.tooltip && (
                        <div className="relative group">
                          <button className="w-4 h-4 text-gray-400">
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                            {item.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}