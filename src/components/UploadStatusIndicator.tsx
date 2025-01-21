import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useUploadStatusStore } from '../lib/store';

export default function UploadStatusIndicator() {
  const { status } = useUploadStatusStore();

  if (!status.isUploading && !status.error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${status.error 
          ? 'bg-red-50 border-red-200' 
          : 'bg-white border-gray-200'
        }
      `}>
        {status.isUploading ? (
          <>
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-900">
              {status.message || 'Uploading...'}
            </span>
          </>
        ) : status.error ? (
          <>
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {status.error}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-900">
              Upload complete
            </span>
          </>
        )}
      </div>
    </div>
  );
}