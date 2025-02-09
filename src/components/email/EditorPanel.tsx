import React from 'react';
import { Mail } from 'lucide-react';

interface EditorPanelProps {
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  lead: {
    leadName: string;
    unlockValue?: string;
  };
  outreachChannel: 'email' | 'linkedin' | 'proposal';
}

export default function EditorPanel({
  input,
  setInput,
  handleKeyDown,
  textareaRef,
  lead,
  outreachChannel
}: EditorPanelProps) {
  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {outreachChannel === 'email' && (
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">To:</span>
                <span className="text-sm font-medium">
                  {lead.unlockValue}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="p-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Your message to ${lead.leadName}...`}
              className="w-full resize-none text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed min-h-[450px] bg-transparent focus:ring-0 focus:border-0"
              style={{ minHeight: '450px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}