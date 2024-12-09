import { useState } from 'react';

export interface PaginationOptions {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function usePagination(initialPageSize: number = 25) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginate = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const totalPages = (totalItems: number) => Math.ceil(totalItems / pageSize);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginate,
    totalPages,
  };
}