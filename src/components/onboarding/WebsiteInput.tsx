import React from 'react';
import Input from '../Input';

interface WebsiteInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export default function WebsiteInput({ value, onChange, error, disabled }: WebsiteInputProps) {
  return (
    <div>
      <Input
        label="Website"
        type="url"
        placeholder="https://example.com"
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />
      <p className="mt-1 text-sm text-gray-500">
        Add your personal website to showcase your expertise and speaking experience
      </p>
    </div>
  );
}
