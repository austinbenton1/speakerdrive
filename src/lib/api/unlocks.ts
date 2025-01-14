import { supabase } from '../supabase';
import type { UnlockedLead } from '../../types/unlocks';
import { User } from '@supabase/supabase-js';

export interface UnlockResponse {
  success: boolean;
  error?: string;
}

export interface UnlockStatus {
  isUnlocked: boolean;
  unlockValue?: string | null;
}

/**
 * Unlocks a lead for the current user by setting the unlocked field to true
 */
export async function unlockLead(leadId: string, user: User): Promise<UnlockResponse> {
  try {
    const { error } = await supabase
      .from('unlocked_leads')
      .update({ unlocked: true })
      .eq('user_id', user.id)
      .eq('lead_id', leadId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error unlocking lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unlock lead'
    };
  }
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
      lead_id,
      created_at,
      leads (
        event_name,
        subtext,
        industry,
        image_url,
        lead_type,
        keywords
      )
    `)
    .eq('user_id', user.id)
    .eq('unlocked', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  return data.map(item => ({
    id: item.lead_id,
    event_name: item.leads.event_name,
    subtext: item.leads.subtext,
    industry: item.leads.industry,
    image: item.leads.image_url,
    unlockDate: new Date(item.created_at),
    lead_type: item.leads.lead_type,
    keywords: item.leads.keywords
  }));
}