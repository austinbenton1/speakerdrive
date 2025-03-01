import React, { useState } from 'react';
import { MoreVertical, Mail, Phone, MapPin, ChevronRight, Link } from 'lucide-react';
import type { Lead } from '../../types';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';
import { supabase } from '../../lib/supabase';

interface LeadListMobileProps {
  leads: Lead[];
  onLeadClick: (leadId: string) => Promise<void>;
  loading?: boolean;
  allLeadsLoaded?: boolean;
  hasActiveFilters?: boolean;
}

const LoadingRow = () => (
  <li className="flex items-center p-4 border-b border-gray-100 bg-white">
    <div className="animate-pulse flex items-center w-full">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>

      {/* Content */}
      <div className="ml-4 flex-1">
        {/* Name and title */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Chevron */}
      <div className="w-5 h-5 bg-gray-200 rounded ml-4"></div>
    </div>
  </li>
);

export default function LeadListMobile({ 
  leads, 
  onLeadClick, 
  loading = false,
  allLeadsLoaded = false,
  hasActiveFilters = false 
}: LeadListMobileProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);
  const { recordedLeads } = useUnlockedLeadsData();

  // Calculate styles based on lead type
  const getStyles = (lead: Lead) => ({
    bg: lead.lead_type === 'Contact' 
      ? 'bg-blue-50 border border-blue-100' 
      : 'bg-emerald-50 border border-emerald-100',
    text: lead.lead_type === 'Contact' 
      ? 'text-blue-600' 
      : 'text-emerald-600'
  });

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="lead-list-card">
      <div className="card-body">
        <ul>
          {loading && !hasActiveFilters ? (
            // Show loading skeleton only when no active filters
            Array.from({ length: 5 }).map((_, index) => (
              <LoadingRow key={index} />
            ))
          ) : leads.length > 0 ? (
            leads.map((lead) => {
              const styles = getStyles(lead);
              const isUnlocked = recordedLeads.some(recordedLead => recordedLead.lead_id === lead.id);
              const isLoading = loadingLeadId === lead.id;

              return (
                <li 
                  key={lead.id}
                  onClick={async () => {
                    if (isLoading) return;
                    setLoadingLeadId(lead.id);
                    try {
                      // Get current user from auth store
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session?.user) return;

                      // Record the visit
                      try {
                        const { error } = await supabase.rpc('record_visit', {
                          var_lead: lead.id,
                          var_user: session.user.id
                        });

                        if (error) {
                          console.error('Failed to record visit:', error);
                          // Continue with navigation even if recording fails
                        }
                      } catch (error) {
                        console.error('Error recording visit:', error);
                        // Continue with navigation even if recording fails
                      }

                      await onLeadClick(lead.id);
                    } finally {
                      setLoadingLeadId(null);
                    }
                  }}
                  className={`flex items-center p-4 border-b border-gray-100 transition-colors cursor-pointer relative ${
                    isUnlocked ? 'bg-blue-50/80 hover:bg-blue-100/90' : 'bg-white hover:bg-gray-50'
                  } ${isLoading ? 'pointer-events-none' : ''}`}
                >
                  <div className="avatar">
                    {lead.image_url ? (
                      <img src={lead.image_url} alt={lead.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {lead.name?.charAt(0) || 'L'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div>
                      <h6 className="lead-name">
                        {(() => {
                          const displayName = lead.unlock_type === 'Unlock Contact Email'
                            ? `${lead.lead_name}${lead.job_title ? `, ${lead.job_title}` : ''}`
                            : lead.event_name || 'Unnamed Lead';
                          return displayName.slice(0, 35) + (displayName.length > 35 ? '...' : '');
                        })()}
                      </h6>
                      <div className="flex items-center gap-1.5">
                        <small className="lead-title">
                          {lead.unlock_type === 'Unlock Contact Email' 
                            ? (lead.event_name || 'No Event').slice(0, 30) + (lead.event_name?.length > 30 ? '...' : '')
                            : (lead.organization || 'No Organization').slice(0, 30) + (lead.organization?.length > 30 ? '...' : '')
                          }
                        </small>
                        <div className={`inline-flex items-center px-1 py-[1px] rounded text-[9px] font-medium transition-colors ${styles.bg} ${styles.text} hover:bg-opacity-75 flex-shrink-0`}>
                          {lead.unlock_type.includes('URL') ? (
                            <Link className="w-2 h-2 mr-[2px]" />
                          ) : (
                            <Mail className="w-2 h-2 mr-[2px]" />
                          )}
                          {lead.unlock_type.replace('Unlock ', '')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="chevron-icon w-5 h-5 text-gray-400 ml-4" />
                </li>
              );
            })
          ) : (
            <div className="p-5 text-center text-gray-500">
              {loading && hasActiveFilters 
                ? "Loading leads - Please wait a moment"
                : "No leads found matching your criteria"
              }
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
