import React, { useState } from 'react';
import { Mail, Link as LinkIcon, Building, Calendar, MapPin, Globe, Copy, ExternalLink, Check, ThumbsUp, Clock, X, Info, ArrowUpRight, Building2 } from 'lucide-react';
import type { SpeakerLead } from '../../types';
import { useLeadUnlock } from '../../hooks/useLeadUnlock';

interface LeadDetailSidebarProps {
  lead: SpeakerLead;
}

export default function LeadDetailSidebar({ lead }: LeadDetailSidebarProps) {
  const { isLeadUnlocked } = useLeadUnlock();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const isUnlocked = isLeadUnlocked(lead.id);

  // Dummy data for demonstration
  const dummyEmail = 'contact@organization.com';
  const dummyUrl = 'https://organization.com/call-for-speakers';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const quickInfoItems = [
    {
      icon: Building,
      label: 'Industry Category',
      value: lead.industryCategory,
      show: true,
    },
    {
      icon: Building2,
      label: 'Organization',
      value: lead.organization || 'Not specified',
      show: true,
    },
    {
      icon: Info,
      label: 'More Info',
      value: 'View Online',
      link: dummyUrl,
      show: true,
    },
    {
      icon: Globe,
      label: 'Domain Type',
      value: `.${lead.extensionType}`,
      show: true,
    },
    {
      icon: Calendar,
      label: 'Added to SpeakerDrive',
      value: lead.addedToSpeakerDrive,
      show: true,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: lead.location,
      show: !!lead.location,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                  <dt className="text-sm text-gray-500">{item.label}</dt>
                </div>
                <dd className="mt-1 text-sm text-gray-900 ml-6">
                  {item.link ? (
                    <a 
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#0066FF] hover:text-[#0052CC]"
                    >
                      {item.value}
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
        </div>
      </div>

      {/* Help Us Improve */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">Help Us Improve</h3>
            <p className="text-xs text-gray-500 mt-1">Rate this lead to help us improve our recommendations</p>
          </div>
          <div className="space-y-3">
            {!feedback ? (
              <>
                <button
                  onClick={() => setFeedback('like')}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-100 hover:border-[#00B341]/20 hover:bg-[#00B341]/5 hover:text-[#00B341] transition-colors"
                >
                  I like it
                </button>
                <button
                  onClick={() => setFeedback('later')}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-100 hover:border-[#0066FF]/20 hover:bg-[#0066FF]/5 hover:text-[#0066FF] transition-colors"
                >
                  Save for later
                </button>
                <button
                  onClick={() => setFeedback('not-relevant')}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Not relevant
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-600">Thanks for your feedback!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}