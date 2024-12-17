import React from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Building, 
  Presentation, 
  GraduationCap,
  HelpCircle 
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
}

export default function LeadDetailSidebar({ lead }: LeadDetailSidebarProps) {
  const { isUnlocked, unlockValue } = useLeadUnlock(lead.id);

  const quickInfoItems: QuickInfoItem[] = [
    {
      icon: Building2,
      label: 'Industry Category',
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
      icon: Building,
      label: 'Organization',
      value: lead.organization || 'Not specified',
      tooltip: lead.tooltipOrganization,
      show: true,
    },
    {
      icon: Building,
      label: 'Organization Type',
      value: lead.organizationType || 'Not specified',
      tooltip: lead.tooltipOrganizationType,
      show: true,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: lead.location || 'Not specified',
      tooltip: lead.tooltipLocation,
      show: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">Quick Information</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {quickInfoItems
            .filter(item => item.show)
            .map((item, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 text-gray-400 mr-2" />
                  <div className="flex-grow">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-gray-900">{item.value}</p>
                      {item.tooltip && (
                        <div className="relative group">
                          <button className="w-4 h-4 text-gray-400">
                            <HelpCircle className="w-full h-full" />
                          </button>
                          <div className="invisible group-hover:visible absolute z-[100] left-0 mt-2 w-[280px] p-3 bg-white border border-gray-100 rounded-lg shadow-lg">
                            <p className="text-sm text-gray-600 whitespace-normal">{item.tooltip}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}