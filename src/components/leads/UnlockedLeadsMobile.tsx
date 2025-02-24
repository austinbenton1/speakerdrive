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
                      <h3 className="text-xs font-medium text-gray-900">
                        {lead.event_name.length > 40 
                          ? `${lead.event_name.slice(0, 40)}...` 
                          : lead.event_name}
                      </h3>
                    </div>

                    {/* Lead Focus */}
                    {lead.focus && (
                      <div>
                        <p className="text-[0.625rem] text-gray-600">
                          {lead.focus.length > 35 
                            ? `${lead.focus.slice(0, 35)}...` 
                            : lead.focus}
                            <span className={`inline-flex ml-2 items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[0.625rem] font-medium ${styles.bg} ${styles.text}`}>
                              <styles.icon className="h-2 w-2" />
                              {lead.lead_type.replace('Unlock ', '')}
                            </span>
                        </p>
                        <div className="flex items-center gap-1 text-[0.625rem] text-gray-600">
                          <Unlock className="h-3 w-3" />
                          {formatDate(lead.unlockDate)}
                          {/* Pitch Preview */}
                          {lead.pitch && (
                            <div>
                              <MessageSquare className="ml-2 h-3 w-3 text-gray-400 text-green-600" />
                            </div>
                          )}
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
