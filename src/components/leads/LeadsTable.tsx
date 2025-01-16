import React from 'react';
import { Layers, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Lead } from '../../types';
import LeadTableRow from './LeadTableRow';
import TablePagination from './TablePagination';
import { usePagination } from '../../hooks/usePagination';

type SortField = 'topic' | 'url' | 'location';
type SortDirection = 'asc' | 'desc';

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onResetFilters: () => void;
  onLeadClick: (leadId: string) => Promise<void>;
  showAllEvents?: boolean;
  uniqueCount?: number;
  selectedLeadType?: string;
}

const LoadingRow = () => (
  <div className="animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-gray-200 h-8 w-8"></div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-64 mt-2"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24 mt-2"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function LeadsTable({ 
  leads, 
  loading = false, 
  onResetFilters, 
  onLeadClick,
  showAllEvents = false,
  uniqueCount = 0,
  selectedLeadType = 'all'
}: LeadsTableProps) {
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Paginate the leads directly (no sorting)
  const paginatedLeads = paginate(leads);

  // Setup wheel event handler
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > 0) {
        // Only prevent default for horizontal scrolling
        e.preventDefault();
        
        // Handle horizontal scrolling
        if (e.shiftKey) {
          // Shift + wheel scrolls horizontally
          container.scrollLeft += e.deltaY;
        } else {
          // Trackpad/mouse horizontal scroll
          container.scrollLeft += e.deltaX;
        }
      }
      // Let vertical scrolling behave naturally
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div className="min-w-[1500px] w-full">
          <div className="grid grid-cols-[575px_275px_230px_200px_240px] gap-0">
            {/* Header */}
            <div className="contents">
              <div className="bg-white px-3 py-3">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-gray-800 ml-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <div>
                    Showing <span className="font-medium">
                      {selectedLeadType === 'all' 
                        ? (showAllEvents ? leads.length : uniqueCount)
                        : leads.length}
                    </span>
                    {selectedLeadType === 'contacts' 
                      ? ' contacts'
                      : selectedLeadType === 'all'
                        ? (showAllEvents ? ' total contacts & events' : ' unique contacts & events')
                        : ' events'}
                  </div>
                </div>
              </div>
              
              {/* Topic Header */}
              <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[16px] border-b-2 border-gray-100">
                Event Topic
              </div>

              {/* URL Header */}
              <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[24px] border-b-2 border-gray-100">
                Event URL
              </div>

              {/* Location Header */}
              <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[24px] border-b-2 border-gray-100">
                Location
              </div>

              <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[64px] border-b-2 border-gray-100">Event Group</div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="contents">
                {Array.from({ length: 5 }).map((_, index) => (
                  <React.Fragment key={index}>
                    <div className="px-3 py-4 border-t border-gray-200">
                      <LoadingRow />
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="contents">
                {paginatedLeads.map(lead => (
                  <LeadTableRow 
                    key={lead.id} 
                    lead={lead}
                    onClick={() => onLeadClick(lead.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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