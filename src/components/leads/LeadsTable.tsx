import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Lead } from '../../types';
import { useTableSort, type SortField } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import { useNavigate } from 'react-router-dom';
import TableHeader from './TableHeader';
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
      <TableHeader 
        pageSize={pageSize} 
        onPageSizeChange={setPageSize} 
        totalItems={leads.length}
        currentPage={currentPage}
      />
      
      <div className="overflow-x-auto">
        <table className="min-w-full relative">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <HeaderCell 
                field="event_name" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="sticky left-0 z-20 bg-white"
              >
                Event
              </HeaderCell>
              <HeaderCell field="unlock_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Unlock Type
              </HeaderCell>
              <HeaderCell field="focus" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Event Audience
              </HeaderCell>
              <HeaderCell field="industry" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Event Category
              </HeaderCell>
              <HeaderCell field="event_format" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Event Format
              </HeaderCell>
              <HeaderCell field="organization_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Organization Type
              </HeaderCell>
              <HeaderCell field="event_info" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Event Info
              </HeaderCell>
              <HeaderCell field="location" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
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
                stickyColumnStyle="bg-white"
                stickyColumnShadow="shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
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