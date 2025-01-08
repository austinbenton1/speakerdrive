import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
  duration?: number;
}

export default function Toast({ message, onClose, type = 'success', duration = 2000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}>
        {type === 'success' ? (
          <Check className="w-4 h-4 flex-shrink-0" />
        ) : (
          <X className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
