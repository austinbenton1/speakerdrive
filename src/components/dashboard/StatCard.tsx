import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar, Users } from 'lucide-react';
import type { DashboardStat } from '../../utils/stats';

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const { name, value, change, trend, icon: Icon, type } = stat;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
        {type === 'event' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <Calendar className="w-3.5 h-3.5" />
            Event Leads
          </span>
        ) : type === 'contact' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Users className="w-3.5 h-3.5" />
            Contact Leads
          </span>
        ) : change ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change}
            {trend === 'up' ? (
              <ArrowUpRight className="w-3 h-3 ml-1" />
            ) : (
              <ArrowDownRight className="w-3 h-3 ml-1" />
            )}
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{name}</div>
    </div>
  );
}