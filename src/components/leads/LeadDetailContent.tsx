import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import type { SpeakerLead } from '../../types';
import { cleanDetailedInfo } from '../../utils/text';
import { parseEventInfo, type EventInfoBlock } from '../../utils/eventInfoParser';
import { parseDetailedInfo, type DetailedInfoBlock } from '../../utils/detailedInfoParser';

interface LeadDetailContentProps {
  lead: SpeakerLead;
}

interface SectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center">
          <Icon className="w-4 h-4 text-gray-400 mr-2" />
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ContentBlock({ title, content }: { title?: string; content: string }) {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      )}
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function LeadDetailContent({ lead }: LeadDetailContentProps) {
  // console.error(lead.detailedInfo);
  // const cleanDetailedInfo=cleanDetailedInfo(lead.detailedInfo);
  const cleanInfo=lead.detailedInfo;
  // console.error(cleanInfo.split('\n')[0]);
  const detailedInfoBlocks = parseDetailedInfo(cleanInfo);
  const eventInfoBlocks = parseEventInfo(lead.eventInfo);

  return (
    <div className="col-span-2 space-y-6">
      <Section icon={Calendar} title="Event Information">
        <div className="space-y-6">
          {eventInfoBlocks.length > 0 ? (
            eventInfoBlocks.map((block, index) => (
              <ContentBlock
                key={index}
                title={block.title}
                content={block.content}
              />
            ))
          ) : (
            <ContentBlock content="No event information available" />
          )}
        </div>
      </Section>

      <Section icon={FileText} title="Detailed Information">
        <div className="space-y-6">
          {detailedInfoBlocks.length > 0 ? (
            detailedInfoBlocks.map((block, index) => (
              <ContentBlock
                key={index}
                title={block.title}
                content={block.content}
              />
            ))
          ) : (
            <ContentBlock content="No detailed information available" />
          )}
        </div>
      </Section>
    </div>
  );
}