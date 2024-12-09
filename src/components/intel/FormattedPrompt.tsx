import React from 'react';

interface FormattedPromptProps {
  promptText: string;
  placeholder: string;
}

export default function FormattedPrompt({ promptText, placeholder }: FormattedPromptProps) {
  const parts = promptText.split('{placeholder}');
  return (
    <span className="font-medium text-gray-900">
      {parts[0]}
      <span className="inline-block bg-gray-100 border border-gray-200 text-gray-700 px-4 py-0.5 rounded-xl">
        {placeholder}
      </span>
      {parts[1]}
    </span>
  );
}