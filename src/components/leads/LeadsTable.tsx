import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lead } from '../../types';
import { useTableSort, type SortField } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import TablePagination from './TablePagination';
import LeadTableRow from './LeadTableRow';

interface Props {
  leads: Lead[];
  loading?: boolean;
  onResetFilters: () => void;
}

const LoadingRow = () => (
  <tr>
    <td className="px-3 py-4 w-[50%]">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        </div>
      </div>
    </td>
    <td className="w-12 px-3 py-4">
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td className="px-3 py-4 w-[25%]">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </td>
    <td className="px-3 py-4 w-[25%]">
      <div className="animate-pulse flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
    </td>
  </tr>
);

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
  className = ''
}: { 
  children: React.ReactNode, 
  field: SortField, 
  sortField: SortField | null, 
  sortDirection: 'asc' | 'desc' | null,
  onSort: (field: SortField) => void,
  className?: string
}) => (
  <th 
    scope="col" 
    className={`${className} px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer`}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
    </div>
  </th>
);

export default function LeadsTable({ leads, loading = false, onResetFilters }: Props) {
  const navigate = useNavigate();
  const { sortField, sortDirection, toggleSort } = useTableSort();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth relative">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <HeaderCell 
                field="event_name" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="w-[50%] sticky left-0 bg-white z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-700">
                    Showing <span className="font-medium mx-1">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium mx-1">{Math.min(currentPage * pageSize, leads.length)}</span> of{' '}
                    <span className="font-medium ml-1">{leads.length}</span>&nbsp;leads&nbsp;
                  </div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm ml-6" aria-label="Pagination">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage === Math.ceil(leads.length / pageSize)}
                      className="relative inline-flex items-center rounded-r-md px-2 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </HeaderCell>
              <th scope="col" className="w-12 px-3 py-2">
                <span className="sr-only">View</span>
              </th>
              <HeaderCell 
                field="location" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="w-[25%]"
              >
                Location
              </HeaderCell>
              <HeaderCell 
                field="keywords" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="min-w-[300px] w-[25%]"
              >
                Keywords
              </HeaderCell>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <LoadingRow key={index} />
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12">
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">No leads found matching your filters</div>
                    <div className="mt-2">
                      <button
                        onClick={onResetFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginate(leads).map((lead) => (
              <LeadTableRow
                key={lead.id}
                lead={lead}
                onClick={() => handleLeadClick(lead.id)}
                stickyFirstColumn={true}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}