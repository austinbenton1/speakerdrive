import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ValuePropositionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

export default function ValueProposition({ value, onChange, error }: ValuePropositionProps) {
  return (
    <div>
      <label
        htmlFor="valueProposition"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Core Value Proposition
      </label>
      <p className="text-sm text-gray-500 mb-3">
        Share your unique message or expertise.
      </p>
      <div className="relative mt-1">
        <MessageSquare className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
        <textarea
          id="valueProposition"
          value={value}
          onChange={onChange}
          rows={4}
          className={`
            block w-full pl-10 pr-3 py-2 resize-none
            border rounded-md shadow-sm
            focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="What unique message, expertise, or transformation do you offer to your audience?"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}