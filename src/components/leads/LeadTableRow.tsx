import React from 'react';
import { Eye, Mail, Link } from 'lucide-react';
import type { Lead } from '../../types';

interface LeadTableRowProps {
  lead: Lead;
  onClick: () => void;
}

export default function LeadTableRow({ lead, onClick }: LeadTableRowProps) {
  const getUnlockTypeStyle = (type: string) => {
    switch (type) {
      case 'Unlock Event URL':
      case 'Unlock Event Email':
        return 'bg-emerald-50 text-emerald-700';
      case 'Unlock Contact Email':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDetailedInfo = (text: string) => {
    const sections: { header: string; content: string }[] = [];
    let currentHeader = '';
    let currentContent = '';

    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (trimmedLine.includes('->')) {
        if (currentHeader) {
          sections.push({ 
            header: currentHeader, 
            content: currentContent.trim() 
          });
        }
        const [header, content] = trimmedLine.split('->').map(s => s.trim());
        currentHeader = header;
        currentContent = content || '';
      } else {
        currentContent += (currentContent ? ' ' : '') + trimmedLine;
      }
    });

    if (currentHeader) {
      sections.push({ 
        header: currentHeader, 
        content: currentContent.trim() 
      });
    }

    return (
      <div className="space-y-3">
        {sections.map(({ header, content }, index) => (
          <div key={index}>
            <div className="font-semibold text-gray-900">{header} →</div>
            <div className="text-gray-600">{content}</div>
          </div>
        ))}

        {/* Event Format and Organization Type */}
        {(lead.event_format || lead.organization_type) && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            {lead.event_format && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Event Format</div>
                <div className="text-sm font-medium text-gray-900">{lead.event_format}</div>
              </div>
            )}
            {lead.organization_type && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Organization Type</div>
                <div className="text-sm font-medium text-gray-900">{lead.organization_type}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <tr onClick={onClick} className="hover:bg-gray-50/80 cursor-pointer group">
      <td className="pl-4 pr-2 py-4 whitespace-nowrap">
        <div className="flex items-center min-w-0">
          <img 
            src={lead.image_url} 
            alt={lead.lead_name}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-[18px] font-medium text-gray-900 truncate">
                {lead.event_name || lead.lead_name}
              </div>
              <button 
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${getUnlockTypeStyle(lead.unlock_type)} hover:bg-opacity-75`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                {lead.unlock_type.includes('URL') ? (
                  <Link className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                )}
                {lead.unlock_type.replace('Unlock ', '')}
              </button>
            </div>
            <div className="mt-1 text-[16px] text-gray-500 truncate">
              {lead.subtext}
            </div>
          </div>
        </div>
      </td>
      <td className="pl-0 pr-8 py-4 whitespace-nowrap text-center">
        <div className="relative group/tooltip">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 shadow-[0_0_0_1px] shadow-gray-200 group-hover:bg-gray-100 group-hover:shadow-gray-300 transition-all duration-200">
            <Eye className="w-5 h-5 text-gray-500 group-hover:text-gray-600 transition-colors" />
          </div>
          
          {lead.detailed_info && (
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200" style={{ zIndex: 9999 }}>
              <div className="bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <div className="text-lg font-semibold text-gray-900 text-left">
                    {lead.event_name || lead.lead_name}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-600 truncate text-left">
                        {lead.subtext}
                      </div>
                    </div>
                    <div className={`
                      ml-3 px-2 py-1 rounded text-xs font-medium inline-flex items-center
                      ${getUnlockTypeStyle(lead.unlock_type)}
                    `}>
                      {lead.unlock_type.includes('URL') ? (
                        <Link className="w-3.5 h-3.5 mr-1.5" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {lead.unlock_type.replace('Unlock ', '')}
                    </div>
                  </div>
                </div>

                <div className="p-4 text-sm leading-relaxed whitespace-normal text-left">
                  {formatDetailedInfo(lead.detailed_info)}
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
            </div>
          )}
        </div>
      </td>
      <td className="pl-4 pr-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500">
          {[lead.city, lead.state, lead.region].filter(Boolean).join(' • ') || 'Location not specified'}
        </span>
      </td>
    </tr>
  );
}