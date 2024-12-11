import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Lead } from '../../types';
import { useTableSort, type SortField } from '../../hooks/useTableSort';
import { usePagination } from '../../hooks/usePagination';
import UnlockButton from './UnlockButton';
import TableHeader from './TableHeader';
import TablePagination from './TablePagination';
import EmptyState from './EmptyState';

interface Props {
  leads: Lead[];
  onLeadClick?: (leadId: string) => void;
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

export default function LeadsTable({ leads, onLeadClick }: Props) {
  const { sortField, sortDirection, toggleSort } = useTableSort();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const stickyColumnStyle = "bg-white/95 backdrop-blur-sm";
  const stickyColumnShadow = "shadow-[8px_0_16px_-6px_rgba(0,0,0,0.2)]";

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                className={`sticky left-[3.5rem] z-10 ${stickyColumnStyle} ${stickyColumnShadow}`}
              >
                Name
              </HeaderCell>
              <HeaderCell field="focus" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Focus
              </HeaderCell>
              <HeaderCell field="lead_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Lead Type
              </HeaderCell>
              <HeaderCell field="unlock_type" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Unlock Type
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
              <HeaderCell 
                field="event_name" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={toggleSort}
                hidden={true}
              >
                Event Name
              </HeaderCell>
              <HeaderCell field="location" sortField={sortField} sortDirection={sortDirection} onSort={toggleSort}>
                Location
              </HeaderCell>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick?.(lead.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className={`sticky left-0 z-10 ${stickyColumnStyle} px-3 py-3 whitespace-nowrap`}>
                  <img 
                    src={lead.image_url} 
                    alt={lead.lead_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </td>
                <td className={`sticky left-[3.5rem] z-10 ${stickyColumnStyle} ${stickyColumnShadow} px-3 py-3 whitespace-nowrap`}>
                  <div className="text-[13.5px] font-medium text-gray-900 truncate max-w-[200px]">{lead.lead_name}</div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-[13.5px] text-gray-500">{lead.focus}</div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
                    {lead.lead_type}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <UnlockButton type={lead.unlock_type} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
                    {lead.industry}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
                    {lead.domain_type}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[13.5px] text-gray-500">
                  {lead.organization || 'N/A'}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[13.5px] text-gray-500">
                  {truncateText(lead.event_info || 'Unlock to view event details')}
                </td>
                <td className="hidden px-3 py-3 whitespace-nowrap text-[13.5px] text-gray-500">
                  {lead.event_name}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
                    {lead.location || 'N/A'}
                  </span>
                </td>
              </tr>
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