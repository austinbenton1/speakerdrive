import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Lead } from '../../types';
import { useTableSort, type SortField } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import { useLeadVisit } from '../../hooks/useLeadVisit';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import LeadTableRow from './LeadTableRow';
import EmptyState from './EmptyState';

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

export default function LeadsTable({ leads }: Props) {
  const { sortField, sortDirection, toggleSort } = useTableSort();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const { visitLead, isRecording } = useLeadVisit();

  const stickyColumnStyle = "bg-white/95 backdrop-blur-sm";
  const stickyColumnShadow = "shadow-[8px_0_16px_-6px_rgba(0,0,0,0.2)]";

  const sortedLeads = [...leads].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = a[sortField]?.toString().toLowerCase() || '';
    const bValue = b[sortField]?.toString().toLowerCase() || '';

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const paginatedLeads = paginate(sortedLeads);

  if (leads.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${isRecording ? 'opacity-75' : ''}`}>
      <TableHeader 
        pageSize={pageSize} 
        onPageSizeChange={setPageSize} 
        totalItems={leads.length}
        currentPage={currentPage}
      />
      
      <div className="overflow-x-auto relative">
        <table className="min-w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th scope="col" className={`sticky left-0 z-10 ${stickyColumnStyle} px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12`}>
                Image
              </th>
              <HeaderCell
                field="lead_name"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={toggleSort}
                className={`sticky left-[3.5rem] z-10 ${stickyColumnStyle} ${stickyColumnShadow} min-w-[400px]`}
              >
                Name
              </HeaderCell>
              <HeaderCell 
                field="focus" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                className="max-w-[300px] w-[300px]"
              >
                Focus
              </HeaderCell>
              <HeaderCell field="lead_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Lead Type
              </HeaderCell>
              <HeaderCell field="industry" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Industry Category
              </HeaderCell>
              <HeaderCell field="domain_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Domain Type
              </HeaderCell>
              <HeaderCell field="organization" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Organization
              </HeaderCell>
              <HeaderCell field="event_info" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Event Info
              </HeaderCell>
              <HeaderCell field="location" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Location
              </HeaderCell>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedLeads.map((lead) => (
              <LeadTableRow
                key={lead.id}
                lead={lead}
                onClick={() => visitLead(lead.id)}
                stickyColumnStyle={stickyColumnStyle}
                stickyColumnShadow={stickyColumnShadow}
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