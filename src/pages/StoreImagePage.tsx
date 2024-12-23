import React from 'react';
import StoredImagesTable from '../components/stored-images/StoredImagesTable';
import { useStoredImages } from '../hooks/useStoredImages';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function StoreImagePage() {
  const { images, loading, error } = useStoredImages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stored Images</h1>
        <p className="text-gray-600">View and manage your stored images</p>
      </div>
      <StoredImagesTable images={images} />
    </div>
  );
}
