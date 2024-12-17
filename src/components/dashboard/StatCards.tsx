import React from 'react';
import StatCard from './StatCard';
import type { DashboardStat } from '../../utils/stats';

interface StatCardsProps {
  stats: DashboardStat[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.name} stat={stat} />
      ))}
    </div>
  );
}