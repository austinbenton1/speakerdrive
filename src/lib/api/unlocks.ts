import { supabase } from '../supabase';
import type { UnlockedLead } from '../../types/unlocks';
import { User } from '@supabase/supabase-js';

export interface UnlockStatus {
  isUnlocked: boolean;
  unlockValue?: string | null;
}

/**
 * Checks if a lead is unlocked for the current user
 */
export async function checkLeadUnlocked(leadId: string, user: User): Promise<UnlockStatus> {
  const { data, error } = await supabase
    .from('unlocked_leads')
    .select(`
      unlocked,
      leads (
        unlock_value
      )
    `)
    .eq('user_id', user.id)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  // If no rows found, lead is not unlocked
  if (!data || data.length === 0) {
    return { isUnlocked: false };
  }

  return {
    isUnlocked: data[0].unlocked || false,
    unlockValue: data[0].leads?.unlock_value
  };
}

/**
 * Fetches recent unlocks for the current user
 */
export async function fetchRecentUnlocks(user: User): Promise<UnlockedLead[]> {
  const { data, error } = await supabase
    .from('unlocked_leads')
    .select(`
      id,
      unlocked,
      created_at,
      leads (
        id,
        unlock_value,
        unlock_type,
        event_name,
        event_date,
        organization_name
      )
    `)
    .eq('user_id', user.id)
    .eq('unlocked', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return data || [];
}