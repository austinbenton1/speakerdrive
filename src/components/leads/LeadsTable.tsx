import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Lead } from '../../types';
import { useTableSort, type SortField } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import TablePagination from './TablePagination';
import LeadTableRow from './LeadTableRow';

interface Props {
  leads: Lead[];
}

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

export default function LeadsTable({ leads }: Props) {
  const navigate = useNavigate();
  const { sortField, sortDirection, toggleSort } = useTableSort();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <HeaderCell 
                field="event_name" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="w-[60%]"
              >
                Available Leads
              </HeaderCell>
              <th scope="col" className="w-12 px-3 py-2">
                <span className="sr-only">View</span>
              </th>
              <HeaderCell 
                field="location" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="w-[40%]"
              >
                Location
              </HeaderCell>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginate(leads).map((lead) => (
              <LeadTableRow
                key={lead.id}
                lead={lead}
                onClick={() => handleLeadClick(lead.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={leads.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}