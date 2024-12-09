import React from 'react';

interface TableHeaderProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  currentPage: number;
}

const pageSizeOptions = [25, 50, 75, 100];

export default function TableHeader({
  pageSize,
  onPageSizeChange,
  totalItems,
  currentPage,
}: TableHeaderProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex items-center">
        <label htmlFor="pageSize" className="text-sm text-gray-700 mr-2">Show</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="text-sm text-gray-700 ml-2">entries</span>
      </div>

      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
    </div>
  );
}