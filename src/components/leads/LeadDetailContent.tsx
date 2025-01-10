import React from 'react';
import { FileText, DollarSign, Network, Calendar, Tag } from 'lucide-react';
import type { SpeakerLead } from '../../types';
import { Section } from './sections/Section';
import { ValueProfileContent } from './sections/ValueProfileContent';

export default function LeadDetailContent({ lead }: { lead: SpeakerLead }) {
  const eventName = lead.eventName || lead.name;

  const processOutreachContent = (content: string) => {
    if (!content) return [];
    
    // First replace double newlines after "Event Expired"
    const processedContent = content.replace(/(Event Expired.*?)(\n\n)/g, '$1\n');
    
    // Split into blocks by double newlines
    const blocks = processedContent.split('\n\n').filter(block => block.trim());
    
    const items: { title: string; pillText?: string; description: string }[] = [];
    let currentItem: { title: string; pillText?: string; description: string } | null = null;

    const processTitle = (title: string): { text: string; pillText?: string } => {
      // Skip if line starts with a hyphen
      if (title.trim().startsWith('-')) {
        return { text: title };
      }

      // First check if title ends with ' ->' and remove it if it does
      if (title.trim().endsWith(' ->')) {
        return { text: title.replace(/\s*->$/, '') };
      }

      // Then check for arrow with content after it
      const arrowMatch = title.match(/(.*?)\s*->\s*(.*)/);
      if (arrowMatch && arrowMatch[2]) {
        return {
          text: `${arrowMatch[1].trim()} →`,
          pillText: arrowMatch[2].trim()
        };
      }
      
      return { text: title };
    };

    blocks.forEach(block => {
      const parts = block.split('\n');
      
      if (parts.length >= 2 && !parts[0].trim().startsWith('-')) {
        // If we have a block with newline and first line doesn't start with hyphen
        if (currentItem) {
          items.push(currentItem);
        }
        const processed = processTitle(parts[0].trim());
        currentItem = {
          title: processed.text,
          pillText: processed.pillText,
          description: parts.slice(1).join('\n').trim()
        };
      } else if (currentItem && block.trim()) {
        // If we have a block without newline and there's a current item,
        // append to its description
        currentItem.description += '\n\n' + block.trim();
      } else if (block.trim() && !block.trim().startsWith('-')) {
        // If we have a block without newline, no current item, and doesn't start with hyphen
        const processed = processTitle(block.trim());
        currentItem = {
          title: processed.text,
          pillText: processed.pillText,
          description: ''
        };
      }
    });

    // Don't forget to add the last item
    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  };

  const keywords = lead.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      <Section icon={FileText} title={`Event Snapshot: ${eventName}`}>
        <div className="space-y-6">
          {lead.detailedInfo ? (
            <div className="space-y-6">
              {lead.detailedInfo.split('\n\n')
                .filter(part => part.trim())
                .map((item) => {
                  const [title, ...descriptionParts] = item.split('->').map(part => part.trim());
                  const description = descriptionParts.join('->').trim();
                  return { title, description };
                })
                .map(({ title, description }, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {title}
                    </h3>
                    <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[15px] text-gray-600">No event snapshot available</p>
          )}
        </div>
      </Section>

      {keywords.length > 0 && (
        <Section icon={Tag} title="Event Keywords">
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section icon={DollarSign} title={`Opportunity Profile: ${eventName}`}>
        <ValueProfileContent valueProfile={lead.valueProfile} />
      </Section>

      <Section 
        icon={Network} 
        title={
          <div className="flex items-center gap-2">
            Outreach Profile
            {lead.unlockType && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {lead.unlockType.replace('Unlock', '').trim()}
              </span>
            )}
          </div>
        }
      >
        {lead.outreachPathways ? (
          <div className="space-y-6">
            {processOutreachContent(lead.outreachPathways).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                  {item.pillText && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {item.pillText}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[15px] text-gray-600 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-gray-600">No outreach profile available</p>
        )}
      </Section>

      <Section icon={Calendar} title="Event Summary">
        <div className="space-y-6">
          {lead.eventInfo ? (
            <div className="space-y-6">
              {lead.eventInfo.split('\n\n')
                .filter(part => part.trim())
                .map((item, index) => {
                  // Only apply bold styling to "About This Event ->"
                  if (item.toLowerCase().startsWith('about this event')) {
                    const [title, ...descriptionParts] = item.split('->').map(part => part.trim());
                    const description = descriptionParts.join('->').trim();
                    return (
                      <div key={index} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          About [{eventName}]
                        </h3>
                        <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                          {description}
                        </p>
                      </div>
                    );
                  }
                  
                  // For all other content, render as regular text
                  return (
                    <div key={index} className="space-y-2">
                      <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
                        {item}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-[15px] text-gray-600">No event summary available</p>
          )}
        </div>
      </Section>
    </div>
  );
}