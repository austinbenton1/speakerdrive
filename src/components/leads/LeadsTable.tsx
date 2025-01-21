import React from 'react';
import { Layers, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Lead } from '../../types';
import LeadTableRow from './LeadTableRow';
import TablePagination from './TablePagination';
import { usePagination } from '../../hooks/usePagination';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

type SortField = 'topic' | 'url' | 'location';
type SortDirection = 'asc' | 'desc';

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onResetFilters: () => void;
  showAllEvents: boolean;
  uniqueCount: number;
  selectedLeadType: string;
  filters: any;
  eventsFilter: string;
  opportunityTags: string[];
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
  showAllEvents,
  uniqueCount,
  selectedLeadType,
  filters,
  eventsFilter,
  opportunityTags
}: LeadsTableProps) {
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll events
      if (e.deltaX !== 0 || e.shiftKey) {
        e.preventDefault();
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        container.scrollLeft += delta;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Paginate the leads directly (no sorting)
  const paginatedLeads = paginate(leads);

  const handleRowClick = async (leadId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Record the visit
    const { error } = await supabase.rpc('record_visit', {
      var_lead: leadId,
      var_user: session.user.id
    });

    if (error) {
      console.error('Error recording visit:', error);
    }

    // Get all lead IDs for navigation
    const leadIds = leads.map(lead => lead.id);
    const currentIndex = leadIds.indexOf(leadId);

    // Create URL parameters for filters
    const params = new URLSearchParams();

    // Add display settings
    params.set('event_display', showAllEvents ? 'all' : 'unique');
    params.set('type', selectedLeadType);

    // Add event filter and tags
    if (eventsFilter) params.set('event', eventsFilter);
    if (opportunityTags?.length) params.set('tags', opportunityTags.join(','));

    // Add all other filters
    if (filters) {
      if (filters.industry?.length) params.set('industry', filters.industry.join(','));
      if (filters.eventFormat?.length) params.set('format', filters.eventFormat.join(','));
      if (filters.organization?.length) params.set('organization', filters.organization.join(','));
      if (filters.organizationType?.length) params.set('orgType', filters.organizationType.join(','));
      if (filters.pastSpeakers?.length) params.set('speakers', filters.pastSpeakers.join(','));
      if (filters.searchAll) params.set('search', filters.searchAll);
      if (filters.jobTitle?.length) params.set('job', filters.jobTitle.join(','));
      if (filters.region) params.set('region', filters.region);
      if (filters.state?.length) params.set('state', filters.state.join(','));
      if (filters.city?.length) params.set('city', filters.city.join(','));
      if (filters.unlockType) params.set('unlock_type', filters.unlockType);
    }

    // Navigate to lead details with state and URL parameters
    navigate(`/leads/${leadId}?${params.toString()}`, {
      state: {
        leadIds,
        currentIndex,
        fromFindLeads: true,
        returnPath: `/find-leads?${params.toString()}`
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="min-w-[1400px] w-full relative">
          <div className="grid grid-cols-[500px_275px_230px_200px_240px] gap-0">
            {/* Header */}
            <div className="contents">
              <div className="bg-white px-3 py-3">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-gray-800 ml-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <div>
                    Showing <span className="font-medium">{
                      selectedLeadType === 'contacts' || filters?.unlockType === 'Unlock Contact Email'
                        ? leads.length // Always show total for contact leads
                        : showAllEvents 
                          ? leads.length 
                          : uniqueCount
                    }</span>
                    {selectedLeadType === 'contacts' 
                      ? ' contacts'
                      : selectedLeadType === 'all'
                        ? (showAllEvents ? ' total contacts & events' : ' unique contacts & events')
                        : ' events'}
                  </div>
                </div>
              </div>
              
              {/* Topic Header */}
              <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[8px] border-b-2 border-gray-100">
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
                  <div key={index} className="contents">
                    <div className="px-3 py-4 border-t border-gray-200 bg-white">
                      <LoadingRow />
                    </div>
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                    <div className="border-t border-gray-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="contents">
                {paginatedLeads.map(lead => (
                  <LeadTableRow 
                    key={lead.id} 
                    lead={lead}
                    onRowClick={handleRowClick}
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