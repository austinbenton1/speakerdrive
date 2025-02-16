import React from 'react';
import { Building2, Globe, MapPin, Building, Presentation, GraduationCap, HelpCircle, ExternalLink, Link, LinkedinIcon, User, Briefcase, Lock, Mail, DollarSign, KeyRound, Unlock } from 'lucide-react';
import { useLeadUnlock } from '../../hooks/useLeadUnlock';
import { useAuth } from '../../contexts/AuthContext';
import { QuickInfoSection } from './sidebar/QuickInfoSection';
import { OrganizationSection } from './sidebar/OrganizationSection';
import { UnlockTypeSection } from './sidebar/UnlockTypeSection';
import { AllUnlocksSection } from './sidebar/AllUnlocksSection';
import type { SpeakerLead } from '../../types';

interface LeadDetailSidebarProps {
  lead: SpeakerLead;
}

export default function LeadDetailSidebar({ lead }: LeadDetailSidebarProps) {
  const { user } = useAuth();
  const { isUnlocked, unlockValue } = useLeadUnlock(lead.id, user, lead);

  const formatLocation = (region?: string, state?: string | string[], city?: string | string[]) => {
    const parts = [];
    if (city) {
      const cityStr = Array.isArray(city) ? city.join(', ') : city;
      parts.push(cityStr);
    }
    if (state) {
      const stateStr = Array.isArray(state) ? state.join(', ') : state;
      parts.push(stateStr);
    }
    if (region) parts.push(region);
    return parts.join(' • ') || 'Location not specified';
  };

  const quickInfoItems = [
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
      value: lead.industry,
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
      value: formatLocation(lead.region, lead.state, lead.city),
      tooltip: lead.tooltipLocation,
      show: !!(lead.region || lead.state || lead.city),
    }
  ];

  const organizationItems = [
    {
      icon: Building,
      label: 'Organization Name',
      value: lead.organization || 'Not specified',
      tooltip: lead.tooltipOrganization,
      show: true,
    },
    {
      icon: Building2,
      label: 'Organization Type',
      value: lead.organizationType || 'Not specified',
      tooltip: lead.tooltipOrganizationType,
      show: true,
    },
    ...(lead.leadType === 'Contact' ? [
      {
        icon: User,
        label: 'Aligned Contact Name',
        value: lead.lead_name || 'Not specified',
        show: true,
      },
      {
        icon: Briefcase,
        label: 'Job Title',
        value: lead.jobTitle || 'Not specified',
        show: true,
      },
      {
        icon: LinkedinIcon,
        label: 'LinkedIn Profile',
        value: lead.infoUrl ? 'View Profile' : null,
        show: !!lead.infoUrl,
        onClick: () => lead.infoUrl && window.open(lead.infoUrl, '_blank', 'noopener,noreferrer'),
        isLink: true
      }
    ] : [
      {
        icon: Globe,
        label: 'Website',
        value: lead.infoUrl ? 'Visit Website' : null,
        show: !!lead.infoUrl,
        onClick: () => lead.infoUrl && window.open(lead.infoUrl, '_blank', 'noopener,noreferrer'),
        isLink: true
      }
    ])
  ];

  const unlockTypeItems = [
    {
      icon: Unlock,
      label: 'Value',
      value: lead.unlockType?.replace('Unlock ', '') || 'Not specified',
      show: true,
    }
  ];

  const allUnlocksItems = [
    {
      value: `View More - ${lead.eventName || lead.name}`,
      eventName: lead.eventName || '',
      show: true,
      isLink: true,
      onClick: () => {
        if (!lead.eventName) return;
        const params = new URLSearchParams({
          event: lead.eventName,
          event_display: 'all'
        });
        if (lead.organization) {
          params.set('organization', lead.organization);
        }
        window.open(`/find-leads?${params.toString()}`, '_blank', 'noopener,noreferrer');
      }
    }
  ];

  return (
    <div className="space-y-6">
      <QuickInfoSection items={quickInfoItems} />
      <UnlockTypeSection items={unlockTypeItems} />
      <OrganizationSection items={organizationItems} />
      <AllUnlocksSection items={allUnlocksItems} />
    </div>
  );
}