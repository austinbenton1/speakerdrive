import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
}

export default function SuccessAlert({ message }: SuccessAlertProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        <p className="text-sm text-green-700">{message}</p>
      </div>
    </div>
  );
}