import React from 'react';
import { Calendar, FileText, DollarSign, Network } from 'lucide-react';
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
      <p className="text-sm text-gray-600 whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function LeadDetailContent({ lead }: LeadDetailContentProps) {
  const parseItems = (text: string | undefined | null) => {
    if (!text) return [];
    const items = text.split('\n\n').filter(part => part.trim()) || [];
    return items.map(item => {
      const [title, ...descriptionParts] = item.split(' ->\n').map(part => part.trim());
      const description = descriptionParts.join(' ->\n').trim();
      return { title, description };
    });
  };

  const parseEventItems = (text: string | undefined | null) => {
    if (!text) return [];
    
    const items = text.split('\n\n').filter(part => part.trim());
    const parsedItems: { title: string; description: string }[] = [];
    
    items.forEach(item => {
      if (item.includes(':')) {
        const [title, ...descParts] = item.split(':');
        parsedItems.push({
          title: title.trim(),
          description: descParts.join(':').trim()
        });
      } else if (parsedItems.length > 0) {
        // Append to the previous item's description
        const lastItem = parsedItems[parsedItems.length - 1];
        lastItem.description = `${lastItem.description}\n${item.trim()}`;
      }
    });
    
    return parsedItems;
  };

  const detailedInfoItems = parseItems(lead.detailedInfo);
  const eventItems = parseEventItems(lead.eventInfo);

  return (
    <div className="col-span-2 space-y-6">
      <Section icon={FileText} title="Opportunity Profile">
        <div className="space-y-6">
          {detailedInfoItems.length > 0 ? (
            <div className="space-y-6">
              {detailedInfoItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  {item.title && (
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <ContentBlock content="No opportunity profile available" />
          )}
        </div>
      </Section>

      <Section icon={DollarSign} title="Value Profile">
        <div className="space-y-6">
          {lead.valueProfile ? (
            <div className="space-y-6">
              {lead.valueProfile
                .split('\n\n')
                .filter(part => part.trim())
                .reduce((pairs: { title: string; description: string }[], part, index, array) => {
                  if (index % 2 === 0) {
                    // If there's a next part, create a pair
                    if (index + 1 < array.length) {
                      pairs.push({
                        title: part.trim(),
                        description: array[index + 1].trim()
                      });
                    }
                  }
                  return pairs;
                }, [])
                .map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <ContentBlock content="No value profile available" />
          )}
        </div>
      </Section>

      <Section icon={Network} title="Outreach Pathways">
        <div className="space-y-6">
          {lead.outreachPathways ? (
            <div className="space-y-6">
              {lead.outreachPathways
                .split('\n\n')
                .filter(part => part.trim())
                .map(item => {
                  const [title, ...descriptionParts] = item.split('->').map(part => part.trim());
                  const description = descriptionParts.join('->').trim();
                  return { title, description };
                })
                .map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <ContentBlock content="No outreach pathways available" />
          )}
        </div>
      </Section>

      <Section icon={Calendar} title="Event Information">
        <div className="space-y-6">
          {eventItems.length > 0 ? (
            <div className="space-y-6">
              {eventItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <ContentBlock content="No event information available" />
          )}
        </div>
      </Section>
    </div>
  );
}