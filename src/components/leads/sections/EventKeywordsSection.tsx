import React from 'react';
import { Tag } from 'lucide-react';
import { Section } from './Section';

interface EventKeywordsSectionProps {
  eventName: string;
  keywords?: string[];
}

export function EventKeywordsSection({ eventName, keywords = ['Leadership Event', 'Procurement Executives', 'Professional Development'] }: EventKeywordsSectionProps) {
  return (
    <Section icon={Tag} title={`Event Keywords: ${eventName}`}>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
          >
            {keyword}
          </span>
        ))}
      </div>
    </Section>
  );
}