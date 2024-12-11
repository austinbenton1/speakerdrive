export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  generateUniqueName?: boolean;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
  type: string;
}

export interface UploadError {
  code: string;
  message: string;
}