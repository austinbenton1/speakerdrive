import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, Calendar, Users } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { UnlockedLead } from '../../types/unlocks';

interface UnlockedLeadsListProps {
  leads: UnlockedLead[];
}

export default function UnlockedLeadsList({ leads }: UnlockedLeadsListProps) {
  const navigate = useNavigate();

  const handleViewLead = (leadId: string, index: number) => {
    // Get array of all lead IDs
    const leadIds = leads.map(lead => lead.id);

    // Navigate to lead detail with state containing IDs and current index
    navigate(`/leads/${leadId}`, {
      state: {
        leadIds,
        currentIndex: index,
        fromUnlockedLeads: true
      }
    });
  };

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
    <table className="min-w-full divide-y divide-gray-200">
      <tbody className="bg-white divide-y divide-gray-200">
        {leads.map((lead, index) => {
          const LeadIcon = lead.lead_type === 'Event' ? Calendar : Users;

          return (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {lead.image ? (
                      <img 
                        src={lead.image}
                        alt={lead.event_name}
                        className="h-[45px] w-[45px] rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp';
                        }}
                      />
                    ) : (
                      <div className="h-[45px] w-[45px] rounded-lg bg-gray-100 flex items-center justify-center">
                        <LeadIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-900">{lead.event_name}</div>
                    <div className="text-xs text-gray-500">{lead.industry}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[300px]">
                      {lead.subtext || 'No description'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(lead.unlockDate)}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleViewLead(lead.id, index)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}