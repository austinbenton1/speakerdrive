import React, { useState } from 'react';
import { MoreVertical, Mail, Phone, MapPin } from 'lucide-react';
import type { Lead } from '../../types';

interface LeadListMobileProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function LeadListMobile({ leads, onLeadClick }: LeadListMobileProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="lead-list-card">
      <div className="card-header">
        <h5 className="card-title">Leads List</h5>
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn p-0" 
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => {}}>Featured Leads</button>
              <button className="dropdown-item" onClick={() => {}}>Filter by Tags</button>
              <button className="dropdown-item" onClick={() => {}}>Show All</button>
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        <ul>
          {leads.map((lead) => (
            <li 
              key={lead.id}
              onClick={() => onLeadClick(lead)}
            >
              <div className="avatar">
                {lead.avatar ? (
                  <img src={lead.avatar} alt={lead.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {lead.name?.charAt(0) || 'L'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div>
                  <h6 className="lead-name">{lead.name || 'Unnamed Lead'}</h6>
                  <small className="lead-title">{lead.title || 'No Title'}</small>
                  <div className="lead-stats">
                    {lead.organization}
                    {lead.location && (
                      <span> • {lead.location}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="contact-icons">
                {lead.email && <Mail className="w-4 h-4 text-gray-400" />}
                {lead.phone && <Phone className="w-4 h-4 text-gray-400" />}
                {lead.location && <MapPin className="w-4 h-4 text-gray-400" />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
