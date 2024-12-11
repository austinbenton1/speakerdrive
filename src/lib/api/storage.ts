import { v4 as uuidv4 } from 'uuid';

interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  generateUniqueName?: boolean;
}

interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
  type: string;
}

interface UploadError {
  code: string;
  message: string;
}

export class FileUploadError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'FileUploadError';
  }
}

export async function uploadFile(
  file: File,
  bucketName: string,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  try {
    // Validate file size
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      throw new FileUploadError(
        'FILE_TOO_LARGE',
        `File size exceeds ${options.maxSizeMB || 5}MB limit`
      );
    }

    // Validate file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new FileUploadError(
        'INVALID_FILE_TYPE',
        `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      );
    }

    // Generate unique file name if requested
    const fileName = options.generateUniqueName 
      ? `${uuidv4()}-${file.name}`
      : file.name;

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucketName);
    formData.append('fileName', fileName);

    // Upload file
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new FileUploadError(error.code || 'UPLOAD_FAILED', error.message);
    }

    const data = await response.json();

    return {
      url: data.url,
      fileName: data.fileName,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(
      'UPLOAD_FAILED',
      'Failed to upload file. Please try again.'
    );
  }
}

export async function deleteFile(fileName: string, bucketName: string): Promise<void> {
  try {
    const response = await fetch('/api/storage/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        bucket: bucketName,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new FileUploadError(error.code || 'DELETE_FAILED', error.message);
    }
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    throw new FileUploadError(
      'DELETE_FAILED',
      'Failed to delete file. Please try again.'
    );
  }
}