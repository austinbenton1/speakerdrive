import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowUpDown, RefreshCw, Eye, Layers } from 'lucide-react';
import type { Lead } from '../types/leads';
import { usePagination } from '../hooks/usePagination';

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

export default function DeduplicateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { currentPage, setCurrentPage, pageSize, setPageSize, paginate } = usePagination(25);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data: leads, error: fetchError } = await supabase
        .from('unique_leads')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (fetchError) throw fetchError;
      setLeads(leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Call deduplicate_leads to refresh the unique_leads table
      const { error: dedupeError } = await supabase
        .rpc('deduplicate_leads');

      if (dedupeError) throw dedupeError;

      // Then fetch the updated list
      await fetchLeads();
    } catch (error) {
      console.error('Error processing leads:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [sortField, sortDirection]);

  useEffect(() => {
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

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Paginate the leads
  const paginatedLeads = paginate(leads);

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deduplicated Leads</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage deduplicated leads from your database
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh List
            </button>
          </div>
        </div>

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
                    <div className="flex items-center gap-2 text-[12px] text-gray-500 ml-2">
                      <Layers className="w-3.5 h-3.5 text-gray-500" />
                      <div>
                        Showing <span className="text-gray-500">{leads.length}</span> Deduplicated Leads
                      </div>
                    </div>
                  </div>
                  
                  {/* Lead Name Header */}
                  <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[8px] border-b-2 border-gray-100">
                    Lead Name
                  </div>

                  {/* Organization Header */}
                  <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[24px] border-b-2 border-gray-100">
                    Organization
                  </div>

                  {/* Event Header */}
                  <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[24px] border-b-2 border-gray-100">
                    Event
                  </div>

                  {/* Type Header */}
                  <div className="bg-white px-3 py-3 text-left text-[13.5px] font-medium text-gray-800 uppercase tracking-wider ml-[64px] border-b-2 border-gray-100">
                    Type
                  </div>
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
                    {paginatedLeads.map((lead) => (
                      <div key={lead.id} className="contents">
                        <div className="px-3 py-4 border-t border-gray-200 bg-white hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {lead.lead_name || '-'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {lead.job_title || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-4 border-t border-gray-200 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.organization || '-'}</div>
                          <div className="text-sm text-gray-500 mt-1">{lead.organization_type || '-'}</div>
                        </div>
                        <div className="px-3 py-4 border-t border-gray-200 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.event_name || '-'}</div>
                          <div className="text-sm text-gray-500 mt-1">{lead.event_format || '-'}</div>
                        </div>
                        <div className="px-3 py-4 border-t border-gray-200 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.unlock_type || '-'}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="px-3 py-4 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center text-purple-600 hover:text-purple-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border-gray-300 rounded-md text-sm"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(leads.length / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(leads.length / pageSize)}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* TODO: Add lead details modal when a lead is selected */}
        {selectedLead && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
            {/* Modal implementation */}
          </div>
        )}
      </div>
    </div>
  );
}
