import React from 'react';
import { Calendar, FileText, DollarSign, Network } from 'lucide-react';
import type { SpeakerLead } from '../../types';

interface SectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200/75 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-100 via-gray-50 to-white">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-white shadow-sm border border-gray-100">
              <Icon className="w-4 h-4 text-[#0066FF]" />
            </div>
            <h2 className="ml-3 text-sm font-semibold text-gray-900">{title}</h2>
          </div>
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
      <p className="text-[15px] text-gray-600 whitespace-pre-line">{content}</p>
    </div>
  );
}

export default function LeadDetailContent({ lead }: { lead: SpeakerLead }) {
  const eventName = lead.eventName || lead.name;

  return (
    <div className="space-y-6">
      <Section icon={FileText} title={`Event Snapshot: ${eventName}`}>
        <div className="space-y-6">
          {lead.detailedInfo ? (
            <div className="space-y-6">
              {lead.detailedInfo.split('\n\n')
                .filter(part => part.trim())
                .map((item, index) => {
                  const [title, ...descriptionParts] = item.split('->').map(part => part.trim());
                  const description = descriptionParts.join('->').trim();
                  return (
                    <div key={index} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {title}
                      </h3>
                      <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <ContentBlock content="No event snapshot available" />
          )}
        </div>
      </Section>

      <Section icon={DollarSign} title={`Opportunity Profile: ${eventName}`}>
        <div className="space-y-6">
          {lead.valueProfile ? (
            <div className="space-y-6">
              {(() => {
                const parts = lead.valueProfile
                  .split('\n\n')
                  .filter(part => part.trim());
                
                const items: { title?: string; description?: string }[] = [];
                let currentItem: { title?: string; description?: string } = {};

                parts.forEach((part) => {
                  if (part.includes('→')) {
                    // If we have a complete item, push it
                    if (currentItem.title || currentItem.description) {
                      items.push(currentItem);
                    }
                    // Use the entire part including the arrow as the title
                    currentItem = {
                      title: part.trim()
                    };
                  } else {
                    if (currentItem.description) {
                      currentItem.description += '\n\n' + part;
                    } else {
                      currentItem.description = part;
                    }
                  }
                });

                // Don't forget to push the last item
                if (currentItem.title || currentItem.description) {
                  items.push(currentItem);
                }

                return items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {item.title && (
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-[15px] text-gray-600 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <ContentBlock content="No opportunity profile available" />
          )}
        </div>
      </Section>

      <Section icon={Network} title={`Outreach Profile: ${eventName}`}>
        <div className="space-y-6">
          {lead.outreachPathways ? (
            <div className="space-y-6">
              {(() => {
                const parts = lead.outreachPathways
                  .split('\n\n')
                  .filter(part => part.trim());
                
                const items: { title?: string; description?: string }[] = [];
                let currentItem: { title?: string; description?: string } = {};

                parts.forEach((part, index) => {
                  const hasArrowWithNewline = part.match(/(.*)->\s*\n([\s\S]*)/);
                  const hasArrowWithoutNewline = part.includes('->') && !hasArrowWithNewline;

                  if (hasArrowWithoutNewline) {
                    // If we have a complete item, push it
                    if (currentItem.title || currentItem.description) {
                      items.push(currentItem);
                    }
                    // Use the entire part as the title
                    currentItem = {
                      title: part.trim()
                    };
                  } else if (hasArrowWithNewline) {
                    // If we have a complete item, push it
                    if (currentItem.title || currentItem.description) {
                      items.push(currentItem);
                    }
                    // Extract title and description from the match
                    currentItem = {
                      title: hasArrowWithNewline[1].trim(),
                      description: hasArrowWithNewline[2].trim()
                    };
                  } else {
                    if (currentItem.description) {
                      currentItem.description += '\n\n' + part;
                    } else {
                      currentItem.description = part;
                    }
                  }
                });

                // Don't forget to push the last item
                if (currentItem.title || currentItem.description) {
                  items.push(currentItem);
                }

                return items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {item.title && (
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-[15px] text-gray-600 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <ContentBlock content="No outreach profile available" />
          )}
        </div>
      </Section>

      <Section icon={Calendar} title={`Event Summary: ${eventName}`}>
        <div className="space-y-6">
          {lead.eventInfo ? (
            <div className="space-y-6">
              {(() => {
                const parts = lead.eventInfo
                  .split('\n\n')
                  .filter(part => part.trim());
                
                const items: { title?: string; description?: string }[] = [];
                let currentItem: { title?: string; description?: string } = {};

                parts.forEach((part, index) => {
                  if (part.includes('->')) {
                    // If we have a complete item, push it
                    if (currentItem.title || currentItem.description) {
                      items.push(currentItem);
                    }
                    const [title, ...descParts] = part.split('->');
                    currentItem = {
                      title: title.trim(),
                      description: descParts.join('->').trim()
                    };
                  } else if (part.includes(':')) {
                    // If we have a complete item, push it
                    if (currentItem.title || currentItem.description) {
                      items.push(currentItem);
                    }
                    const [title, ...descParts] = part.split(':');
                    currentItem = {
                      title: title.trim(),
                      description: descParts.join(':').trim()
                    };
                  } else {
                    if (currentItem.description) {
                      currentItem.description += '\n\n' + part;
                    } else {
                      currentItem.description = part;
                    }
                  }
                });

                // Don't forget to push the last item
                if (currentItem.title || currentItem.description) {
                  items.push(currentItem);
                }

                return items.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {item.title && (
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-[15px] text-gray-600 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <ContentBlock content="No event summary available" />
          )}
        </div>
      </Section>
    </div>
  );
}