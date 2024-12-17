import { RecordedLead } from '../types/leads';
import { Unlock, Calendar, Users, Mail, Eye } from 'lucide-react';
import { isCurrentMonth } from './date';
import { getUnlockedLeads } from './leads';
import type { LucideIcon } from 'lucide-react';

export interface DashboardStat {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export function calculateMonthlyVisits(leads: RecordedLead[]): number {
  return leads.filter(lead => isCurrentMonth(new Date(lead.unlocked_at))).length;
}

export function calculateMonthlyUnlockedLeads(leads: RecordedLead[]): number {
  const unlockedLeads = getUnlockedLeads(leads);
  return unlockedLeads.filter(lead => 
    isCurrentMonth(new Date(lead.unlocked_at))
  ).length;
}

export function calculateDashboardStats(leads: RecordedLead[]): DashboardStat[] {
  const monthlyVisits = calculateMonthlyVisits(leads);
  const unlockedLeads = getUnlockedLeads(leads);
  const monthlyUnlockedLeads = unlockedLeads.filter(lead => 
    isCurrentMonth(new Date(lead.unlocked_at))
  ).length;

  const unlockedEventLeads = unlockedLeads.filter(lead => 
    lead.lead_type === 'Event' && 
    isCurrentMonth(new Date(lead.unlocked_at))
  ).length;

  const unlockedContactLeads = unlockedLeads.filter(lead => 
    lead.lead_type === 'Contact' && 
    isCurrentMonth(new Date(lead.unlocked_at))
  ).length;

  return [
    {
      name: 'Total Visited Leads This Month',
      value: monthlyVisits.toString(),
      change: '+10.3%',
      trend: 'up',
      icon: Eye,
    },
    {
      name: 'Total Leads Unlocked This Month',
      value: monthlyUnlockedLeads.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: Unlock,
    },
    {
      name: 'Event Leads Unlocked',
      value: unlockedEventLeads.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: Calendar,
    },
    {
      name: 'Contact Leads Unlocked',
      value: unlockedContactLeads.toString(),
      change: '+15.4%',
      trend: 'up',
      icon: Users,
    }
  ];
}