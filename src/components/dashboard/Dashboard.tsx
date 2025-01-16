import React from 'react';
import { Loader } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';
import { calculateDashboardStats } from '../../utils/stats';
import { useRandomSort } from '../../hooks/useRandomSort';
import StatCards from './StatCards';
import RecentUnlocks from './RecentUnlocks';
import IndustryDistribution from './IndustryDistribution';

export default function Dashboard() {
  const location = useLocation();
  const { recordedLeads, loading, error } = useUnlockedLeadsData();
  const { sortConfig } = useRandomSort(); // This handles all sort logic
  const stats = calculateDashboardStats(recordedLeads);

  console.log('[Dashboard] Render - Path:', location.pathname);
  console.log('[Dashboard] Current sort:', sortConfig);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your speaking opportunities and engagement metrics</p>
      </div>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentUnlocks />
        </div>
        <div>
          <IndustryDistribution />
        </div>
      </div>
    </div>
  );
}