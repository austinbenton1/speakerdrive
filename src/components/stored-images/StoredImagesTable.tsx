import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import type { StoredImage } from '../../types/storedImage';
import { useTableSort } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import TableHeader from '../leads/TableHeader';
import TablePagination from '../leads/TablePagination';
import { processAndUploadImage } from '../../utils/imageStorage';

interface Props {
  images: StoredImage[];
}

type SortField = keyof StoredImage;

const SortIcon = ({ field, sortField, sortDirection }: { field: SortField, sortField: SortField | null, sortDirection: 'asc' | 'desc' | null }) => {
  if (field !== sortField) {
    return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
  }
  return sortDirection === 'asc' ? (
    <ChevronUp className="w-3.5 h-3.5 text-gray-700" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-gray-700" />
  );
};

const HeaderCell = ({ 
  children, 
  field, 
  sortField, 
  sortDirection, 
  onSort,
  className = '',
  hidden = false
}: { 
  children: React.ReactNode, 
  field: SortField, 
  sortField: SortField | null, 
  sortDirection: 'asc' | 'desc' | null,
  onSort: (field: SortField) => void,
  className?: string,
  hidden?: boolean
}) => (
  <th 
    scope="col" 
    className={`${className} px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${hidden ? 'hidden' : ''}`}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
    </div>
  </th>
);

const StoredImageRow = ({ 
  image, 
  checked,
  onCheckChange 
}: { 
  image: StoredImage;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
}) => {
  return (
    <tr className={`hover:bg-gray-50 ${checked ? 'bg-blue-50' : ''}`}>
      <td className="px-3 py-3 whitespace-nowrap">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <img 
          src={image.image_url} 
          alt={image.lead_name}
          className="h-8 w-8 rounded-full object-cover"
        />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="text-[13.5px] font-medium text-gray-900">
          {image.lead_name}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
          {image.lead_type}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="text-[13.5px] text-gray-500">
          {image.industry}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="text-[13.5px] text-gray-500">
          {image.organization || 'N/A'}
        </span>
      </td>
    </tr>
  );
};

export default function StoredImagesTable({ images }: Props) {
  const { sortField, sortDirection, toggleSort } = useTableSort<SortField>();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [processingErrors, setProcessingErrors] = useState<string[]>([]);

  // Initialize all images as selected by default
  useEffect(() => {
    setSelectedImages(new Set(images.map(img => img.id)));
  }, [images]);

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(images.map(img => img.id)));
    } else {
      setSelectedImages(new Set());
    }
  };

  const handleCheckImage = (imageId: string, checked: boolean) => {
    const newSelected = new Set(selectedImages);
    if (checked) {
      newSelected.add(imageId);
    } else {
      newSelected.delete(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleUpdateImages = async () => {
    setProcessing(true);
    setProcessedCount(0);
    setProcessingErrors([]);

    const selectedIds = Array.from(selectedImages);
    const selectedImageData = images.filter(img => selectedIds.includes(img.id));

    for (const image of selectedImageData) {
      try {
        const success = await processAndUploadImage(image.id, image.image_url);
        if (success) {
          setProcessedCount(prev => prev + 1);
          // Remove from selected images as it's processed
          setSelectedImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(image.id);
            return newSet;
          });
        } else {
          setProcessingErrors(prev => [...prev, `Failed to process ${image.lead_name}`]);
        }
      } catch (error) {
        setProcessingErrors(prev => [...prev, `Error processing ${image.lead_name}: ${error.message}`]);
      }
    }

    setProcessing(false);
  };

  const stickyColumnStyle = "bg-white/95 backdrop-blur-sm";
  const stickyColumnShadow = "shadow-[8px_0_16px_-6px_rgba(0,0,0,0.2)]";

  const sortedImages = [...images].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = a[sortField]?.toString().toLowerCase() || '';
    const bValue = b[sortField]?.toString().toLowerCase() || '';

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const paginatedImages = paginate(sortedImages);

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No non-persistent images found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdateImages}
              disabled={selectedImages.size === 0 || processing}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedImages.size > 0 && !processing
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {processing ? 'Processing...' : 'Update Image'}
            </button>
            {selectedImages.size > 0 && (
              <span className="text-sm text-gray-500">
                {selectedImages.size} {selectedImages.size === 1 ? 'image' : 'images'} selected
              </span>
            )}
          </div>
          {processing && processedCount > 0 && (
            <span className="text-sm text-green-600">
              Processed {processedCount} of {Array.from(selectedImages).length} images
            </span>
          )}
          {processingErrors.length > 0 && (
            <div className="text-sm text-red-600">
              {processingErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>
        <TableHeader 
          pageSize={pageSize} 
          onPageSizeChange={setPageSize} 
          totalItems={images.length}
          currentPage={currentPage}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedImages.size === images.length}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className={`sticky left-0 z-10 ${stickyColumnStyle} px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12`}>
                Image
              </th>
              <HeaderCell
                field="lead_name"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={toggleSort}
                className={`sticky left-[3.5rem] z-10 ${stickyColumnStyle} ${stickyColumnShadow}`}
              >
                Name
              </HeaderCell>
              <HeaderCell
                field="lead_type"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={toggleSort}
              >
                Type
              </HeaderCell>
              <HeaderCell
                field="industry"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={toggleSort}
              >
                Industry
              </HeaderCell>
              <HeaderCell
                field="organization"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={toggleSort}
              >
                Organization
              </HeaderCell>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedImages.map((image) => (
              <StoredImageRow 
                key={image.id} 
                image={image}
                checked={selectedImages.has(image.id)}
                onCheckChange={(checked) => handleCheckImage(image.id, checked)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={images.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
