import React from 'react';
import { PieChart } from 'lucide-react';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';
import { calculateIndustryDistribution } from '../../utils/industryAnalytics';
import LoadingSpinner from '../common/LoadingSpinner';

export default function IndustryDistribution() {
  const { recordedLeads, loading, error } = useUnlockedLeadsData();
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <p className="text-sm text-red-600">Failed to load industry data</p>
        </div>
      </div>
    );
  }

  const industryStats = calculateIndustryDistribution(recordedLeads);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Industry Distribution</h2>
          <p className="text-sm text-gray-500">
            {industryStats.reduce((sum, stat) => sum + stat.count, 0)} total unlocked leads
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <PieChart className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      
      <div className="space-y-4">
        {industryStats.map((industry) => (
          <div key={industry.label} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {industry.label}
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {industry.count}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({industry.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-700"
                style={{ width: `${industry.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}