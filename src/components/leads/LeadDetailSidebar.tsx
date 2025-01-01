import React from 'react';
import { Building2, Globe, MapPin, Building, Presentation, GraduationCap, HelpCircle, ExternalLink, Link, LinkedinIcon } from 'lucide-react';
import { useLeadUnlock } from '../../hooks/useLeadUnlock';
import { QuickInfoSection } from './sidebar/QuickInfoSection';
import { OrganizationSection } from './sidebar/OrganizationSection';
import type { SpeakerLead } from '../../types';

interface LeadDetailSidebarProps {
  lead: SpeakerLead;
}

export default function LeadDetailSidebar({ lead }: LeadDetailSidebarProps) {
  const { isUnlocked, unlockValue } = useLeadUnlock(lead.id);

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

  const organizationItems = [
    {
      icon: Building,
      label: 'Host Organization',
      value: lead.organization || 'Not specified',
      tooltip: lead.tooltipOrganization,
      show: true,
    },
    {
      icon: lead.leadType === 'Contact' ? LinkedinIcon : Globe,
      label: lead.leadType === 'Contact' ? 'LinkedIn Profile' : 'Website',
      value: lead.infoUrl ? (lead.leadType === 'Contact' ? 'View Profile' : 'Visit Website') : null,
      tooltip: lead.leadType === 'Contact' ? 'View LinkedIn Profile' : 'Visit Organization Website',
      show: !!lead.infoUrl,
      onClick: () => lead.infoUrl && window.open(lead.infoUrl, '_blank', 'noopener,noreferrer'),
      isLink: true
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
      <QuickInfoSection items={quickInfoItems} />
      <OrganizationSection items={organizationItems} />
    </div>
  );
}