import React, { useCallback, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadFile, FileUploadError } from '../lib/api/storage';

interface FileUploaderProps {
  bucketName: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  onUploadSuccess?: (response: { url: string; fileName: string }) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUploader({
  bucketName,
  maxSizeMB = 5,
  allowedTypes,
  onUploadSuccess,
  onUploadError,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setIsUploading(true);
      setUploadedFile(null);

      const response = await uploadFile(file, bucketName, {
        maxSizeMB,
        allowedTypes,
        generateUniqueName: true,
      });

      setUploadedFile({
        name: file.name,
        url: response.url,
      });

      onUploadSuccess?.({
        url: response.url,
        fileName: response.fileName,
      });
    } catch (err) {
      const error = err as FileUploadError;
      const errorMessage = error.message || 'Failed to upload file';
      setError(errorMessage);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!uploadedFile && !isUploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            accept={allowedTypes?.join(',')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className={`
            w-10 h-10 mb-4
            ${isDragging ? 'text-blue-500' : 'text-gray-400'}
          `} />
          
          <p className="text-sm text-gray-600 text-center mb-1">
            Drag and drop your file here, or click to select
          </p>
          
          <p className="text-xs text-gray-500 text-center">
            Maximum file size: {maxSizeMB}MB
            {allowedTypes && ` • Allowed types: ${allowedTypes.join(', ')}`}
          </p>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
          <Loader className="w-5 h-5 text-blue-500 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Uploading file...</span>
        </div>
      )}

      {uploadedFile && (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-900">{uploadedFile.name}</span>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 border border-red-200 rounded-lg bg-red-50 mt-2">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}