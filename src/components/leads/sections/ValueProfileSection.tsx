import React from 'react';
import { DollarSign } from 'lucide-react';
import { Section } from './Section';
import { ValueProfileContent } from './ValueProfileContent';

interface ValueProfileSectionProps {
  eventName: string;
  valueProfile: string | undefined;
}

export function ValueProfileSection({ eventName, valueProfile }: ValueProfileSectionProps) {
  return (
    <Section icon={DollarSign} title={`Opportunity Profile: ${eventName}`}>
      <ValueProfileContent valueProfile={valueProfile} />
    </Section>
  );
}