import React from 'react';
import { Star, Link, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SpeakerLead } from '../types';

interface Props {
  leads: SpeakerLead[];
  onLeadSelect?: (lead: SpeakerLead) => void;
}

const UnlockButton = ({ type }: { type: string }) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'Event URL':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'Contact Email':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'Event Email':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'Event URL':
        return <Link className="w-4 h-4 mr-1.5" />;
      case 'Contact Email':
      case 'Event Email':
        return <Mail className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <button
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getButtonStyle()}`}
      onClick={(e) => e.stopPropagation()}
    >
      {getIcon()}
      {type}
    </button>
  );
};

export default function LeadsTable({ leads }: Props) {
  const navigate = useNavigate();
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
              Image
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Focus
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unlock Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Industry Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organization
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <img 
                  src={lead.image} 
                  alt={lead.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{lead.focus}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-gray-50 text-gray-900">
                  {lead.leadType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <UnlockButton type={lead.unlockType} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-gray-50 text-gray-900">
                  {lead.industryCategory}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-gray-50 text-gray-900">
                  .{lead.extensionType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {lead.hostOrganization || 'TechCorp Inc.'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {truncateText(lead.eventPurpose || 'Unlock to view event details')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}