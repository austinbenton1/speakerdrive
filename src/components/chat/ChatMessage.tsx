import React from 'react';
import { User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  isAi: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export default function ChatMessage({ content, isAi, timestamp, status }: ChatMessageProps) {
  const getStatusIcon = () => {
    if (!status || isAi) return null;

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
    <div className={`flex gap-4 p-6 ${isAi ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex-shrink-0">
        {isAi ? (
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
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {isAi ? 'SpeakerDrive AI' : 'You'}
          </span>
          <span className="text-xs text-gray-500">
            {timestamp.toLocaleTimeString()}
          </span>
          {getStatusIcon()}
        </div>
        <div className="text-gray-700 prose prose-sm max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
}