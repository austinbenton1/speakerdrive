import { useState } from 'react';

export interface PaginationOptions {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function usePagination(initialPageSize: number = 25) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const paginate = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const totalPages = (totalItems: number) => Math.ceil(totalItems / pageSize);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    paginate,
    totalPages,
  };
}