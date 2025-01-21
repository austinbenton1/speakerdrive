import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Calendar, Users, Building2, MapPin, Tag, ExternalLink, Unlock } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { UnlockedLead } from '../../types/unlocks';
import { Tooltip } from '../ui/Tooltip';
import TablePagination from './TablePagination';
import { usePagination } from '../../hooks/usePagination';

interface UnlockedLeadsListProps {
  leads: UnlockedLead[];
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

export default function UnlockedLeadsList({ leads }: UnlockedLeadsListProps) {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
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

  const paginatedLeads = paginate(leads);

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No unlocked leads</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start unlocking leads to track them here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 hide-scrollbar"
      >
        <div className="min-w-full divide-y divide-gray-200">
          {paginatedLeads.map((lead) => {
            const LeadIcon = lead.lead_type === 'Event' ? Calendar : Users;
            const styles = {
              bg: lead.lead_type === 'Contact' 
                ? 'bg-blue-50 border border-blue-100' 
                : 'bg-emerald-50 border border-emerald-100',
              text: lead.lead_type === 'Contact' 
                ? 'text-blue-600' 
                : 'text-emerald-600',
              dot: lead.lead_type === 'Contact'
                ? 'bg-blue-400'
                : 'bg-emerald-400'
            };

            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`, {
                  state: {
                    leadIds: leads.map(l => l.id),
                    currentIndex: leads.findIndex(l => l.id === lead.id),
                    fromUnlockedLeads: true
                  }
                })}
                className="group relative flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
              >
                {/* Lead Image */}
                <div className="flex-shrink-0">
                  {lead.image ? (
                    <img
                      src={lead.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <LeadIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Lead Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {lead.event_name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                      {lead.lead_type}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                    {lead.industry && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        <span>{lead.industry}</span>
                      </div>
                    )}
                    {lead.subtext && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.subtext}</span>
                      </div>
                    )}
                  </div>

                  {lead.focus && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {lead.focus}
                    </p>
                  )}
                </div>

                {/* Unlock Value */}
                <div className="flex-shrink-0 w-[400px] pr-16">
                  <div className="flex items-center gap-1.5">
                    <Unlock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {lead.unlock_value || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Unlock Date */}
                <div className="flex-shrink-0 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>Unlocked {formatDate(lead.unlockDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 px-4 py-3">
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={leads.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}