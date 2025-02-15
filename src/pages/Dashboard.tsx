import React from 'react';
import { Loader } from 'lucide-react';
import { useUnlockedLeadsData } from '../hooks/useUnlockedLeadsData';
import { calculateDashboardStats } from '../utils/stats';
import StatCards from '../components/dashboard/StatCards';
import RecentUnlocks from '../components/dashboard/RecentUnlocks';
import IndustryDistribution from '../components/dashboard/IndustryDistribution';
import RequestLead from '../components/dashboard/RequestLead';

export default function Dashboard() {
  const { recordedLeads, loading, error } = useUnlockedLeadsData();
  const stats = calculateDashboardStats(recordedLeads);

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
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your leads, opportunities and engagement metrics</p>
      </div>

      <div className="mb-6 sm:mb-8">
        <StatCards stats={stats} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 min-w-0 flex-1">
        <div className="lg:col-span-2 min-w-0">
          <RecentUnlocks />
        </div>
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <IndustryDistribution />
          <RequestLead />
        </div>
      </div>
    </div>
  );
}