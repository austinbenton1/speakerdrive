import React from 'react';
import { Eye, Unlock, Calendar, Users } from 'lucide-react';
import type { DashboardStat } from '../../utils/stats';

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const { name, value, icon: Icon, type } = stat;

  const getBadgeContent = () => {
    switch (type) {
      case 'event':
        return {
          icon: <Calendar className="w-3.5 h-3.5" />,
          text: 'Event Leads',
          style: 'bg-emerald-100 text-emerald-700'
        };
      case 'contact':
        return {
          icon: <Users className="w-3.5 h-3.5" />,
          text: 'Contact Leads',
          style: 'bg-blue-100 text-blue-700'
        };
      case 'visited':
        return {
          icon: <Eye className="w-3.5 h-3.5" />,
          text: 'Visited Leads',
          style: 'bg-purple-100 text-purple-700'
        };
      case 'unlocked':
        return {
          icon: <Unlock className="w-3.5 h-3.5" />,
          text: 'Unlocked Leads',
          style: 'bg-amber-100 text-amber-700'
        };
      default:
        return null;
    }
  };

  const badgeContent = getBadgeContent();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
        {badgeContent && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${badgeContent.style}`}>
            {badgeContent.icon}
            {badgeContent.text}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{name}</div>
    </div>
  );
}