import React from 'react';
import { User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatTime } from '../../utils/date';
import { formatChatMessage } from '../../utils/chat';

interface ChatMessageProps {
  content: string;
  isBot: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export default function ChatMessage({ content, isBot, timestamp, status }: ChatMessageProps) {
  const getStatusIcon = () => {
    if (!status || isBot) return null;
    switch (status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className={`flex gap-3 p-3`}>
      <div className="flex-shrink-0">
        {isBot ? (
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
            <img 
              src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69632642282678b099.png"
              alt="SpeakerDrive AI"
              className="w-5 h-5"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-900">
            {isBot ? 'SpeakerDrive AI' : 'You'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="text-gray-700 prose prose-sm max-w-none whitespace-pre-wrap break-words">
          {formatChatMessage(content)}
        </div>
      </div>
    </div>
  );
}