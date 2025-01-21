import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string | Error;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  const errorMessage = message instanceof Error ? message.message : message;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <p className="text-sm text-red-700">{errorMessage}</p>
      </div>
    </div>
  );
}