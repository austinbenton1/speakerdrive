import React from 'react';
import StoredImagesTable from '../components/stored-images/StoredImagesTable';
import { useStoredImages } from '../hooks/useStoredImages';

export default function StoreImagePage() {
  const { images, loading, error } = useStoredImages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Non-Persistent Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage images that need to be stored permanently
        </p>
      </div>

      <StoredImagesTable images={images} />
    </div>
  );
}
