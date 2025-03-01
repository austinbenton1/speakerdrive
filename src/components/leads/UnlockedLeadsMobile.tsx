import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  ChevronRight,
  Unlock,
  Mail,
  Link,
  Tag
} from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { UnlockedLead } from '../../types/unlocks';

interface UnlockedLeadsMobileProps {
  leads: UnlockedLead[];
}

export default function UnlockedLeadsMobile({ leads }: UnlockedLeadsMobileProps) {
  const navigate = useNavigate();

  // Calculate styles based on lead type
  const getStyles = (lead: UnlockedLead) => {
    switch (lead.lead_type) {
      case 'Unlock Contact Email':
        return {
          bg: 'bg-blue-50 border border-blue-100',
          text: 'text-blue-600',
          icon: Mail
        };
        case 'Unlock Event URL':
      case 'Unlock Event Email':
        return {
          bg: 'bg-emerald-50 border border-emerald-100',
          text: 'text-emerald-600',
          icon: Mail
        };
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">No unlocked leads</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start unlocking leads to track them here
        </p>
      </div>
    );
  }

  return (
    <div className="lead-list-mobile">
      <ul className="divide-y divide-gray-200">
        {leads.map((lead) => {
          const styles = getStyles(lead);
          const LeadIcon = lead.lead_type === 'Unlock Contact Email' ? Users : Calendar;

          return (
            <li 
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`, {
                state: {
                  leadIds: leads.map(l => l.id),
                  currentIndex: leads.findIndex(l => l.id === lead.id),
                  fromUnlockedLeads: true
                }
              })}
              className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="px-4 py-4 sm:px-6">
                {/* Lead Header */}
                <div className="flex items-center gap-3">
                  {/* Lead Icon/Image */}
                  <div className="flex-shrink-0">
                    {lead.image ? (
                      <img
                        src={lead.image}
                        alt={lead.event_name || 'Lead'}
                        className="h-10 w-10 rounded-full object-cover bg-white"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <LeadIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Lead Name and Type */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900" style={{ marginBottom: '1.25px' }}>
                        {(() => {
                          const displayName = lead.lead_type === 'Unlock Contact Email'
                            ? `${lead.lead_name || ''}${lead.job_title ? `, ${lead.job_title}` : ''}`
                            : lead.event_name || 'Unnamed Lead';
                          return displayName.slice(0, 35) + (displayName.length > 35 ? '...' : '');
                        })()}
                      </h3>
                    </div>

                    {/* Lead Focus */}
                    {lead.focus && (
                      <div>
                        <p className="text-xs text-gray-600" style={{ marginBottom: '1.25px' }}>
                        {lead.lead_type === 'Unlock Contact Email' 
                          ? (lead.event_name || 'No Event').slice(0, 40) + (lead.event_name?.length > 40 ? '...' : '')
                          : (lead.organization || 'No Organization').slice(0, 40) + (lead.organization?.length > 40 ? '...' : '')
                        }
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-600" style={{ marginBottom: '1.25px' }}>
                          <span className={`mr-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${styles.bg} ${styles.text}`}>
                            <styles.icon className="h-3 w-3 mr-1" />
                            {lead.lead_type.replace('Unlock ', '')}
                          </span>
                          <Unlock className="h-3 w-3" />
                          {formatDate(lead.unlockDate)}
                          {/* Pitch Preview */}
                          {lead.pitch && (
                            <div>
                              <MessageSquare className="ml-2 h-4 w-4 text-gray-400 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600" style={{ marginBottom: '1.25px' }}>
                          {lead.lead_type.includes('URL') ? (
                            <Link className="h-3 w-3" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                          {lead.unlock_value.length > 40 
                            ? `${lead.unlock_value.slice(0, 40)}...` 
                            : lead.unlock_value}
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
