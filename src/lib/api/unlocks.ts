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
 * Unlocks a lead for the current user
 */
export async function unlockLead(leadId: string, user: User): Promise<UnlockResponse> {
  try {
    // Check if lead is already unlocked
    const { data: existingUnlock, error: checkError } = await supabase
      .from('unlocked_leads')
      .select('*')
      .eq('user_id', user.id)
      .eq('lead_id', leadId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw checkError;
    }

    if (existingUnlock) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('unlocked_leads')
        .update({ unlocked: true })
        .eq('user_id', user.id)
        .eq('lead_id', leadId);

      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('unlocked_leads')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          unlocked: true
        });

      if (insertError) throw insertError;
    }

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
    .select('unlocked, unlock_value')
    .eq('user_id', user.id)
    .eq('lead_id', leadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return { isUnlocked: false };
    }
    throw error;
  }

  return {
    isUnlocked: data.unlocked || false,
    unlockValue: data.unlock_value
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