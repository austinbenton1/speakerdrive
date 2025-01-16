import React from 'react';
import { Globe } from 'lucide-react';
import Input from '../Input';

interface WebsiteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function Website({
  value,
  onChange,
  disabled = false
}: WebsiteProps) {
  return (
    <Input
      label="Website"
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      icon={Globe}
      placeholder="https://example.com"
      disabled={disabled}
    />
  );
}
