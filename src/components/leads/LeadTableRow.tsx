import React from 'react';
import type { Lead } from '../../types';

interface LeadTableRowProps {
  lead: Lead;
  onClick: () => void;
  stickyColumnStyle: string;
  stickyColumnShadow: string;
}

export default function LeadTableRow({ 
  lead, 
  onClick,
  stickyColumnStyle,
  stickyColumnShadow
}: LeadTableRowProps) {
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <tr
      onClick={onClick}
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
        <div 
          className="text-[13.5px] font-medium text-gray-900 truncate max-w-[400px]"
          title={lead.lead_name}
        >
          {lead.lead_name}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap max-w-[300px] w-[300px]">
        <div 
          className="text-[13.5px] text-gray-500 truncate"
          title={lead.focus}
        >
          {lead.focus}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
          {lead.lead_type}
        </span>
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
        <div 
          className="truncate"
          title={lead.event_info || 'No event details available'}
        >
          {truncateText(lead.event_info || 'No event details available')}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="inline-flex px-2.5 py-1 rounded-md text-[13.5px] font-medium bg-gray-100 text-gray-900">
          {lead.location || 'N/A'}
        </span>
      </td>
    </tr>
  );
}