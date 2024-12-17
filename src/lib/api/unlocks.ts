import { supabase } from '../supabase';
import type { UnlockedLead } from '../../types/unlocks';

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
export async function unlockLead(leadId: string): Promise<UnlockResponse> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

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
export async function checkLeadUnlocked(leadId: string): Promise<UnlockStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isUnlocked: false };

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
      .maybeSingle();

    if (error) {
      console.error('Error checking lead unlock status:', error);
      return { isUnlocked: false };
    }

    return {
      isUnlocked: data?.unlocked || false,
      unlockValue: data?.leads?.unlock_value
    };
  } catch (error) {
    console.error('Error checking lead unlock status:', error);
    return { isUnlocked: false };
  }
}

/**
 * Fetches recent unlocks for the current user
 */
export async function fetchRecentUnlocks(): Promise<UnlockedLead[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('unlocked_leads')
      .select(`
        lead_id,
        created_at,
        leads (
          lead_name,
          focus
        )
      `)
      .eq('user_id', user.id)
      .eq('unlocked', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map(unlock => ({
      name: unlock.leads.lead_name,
      focus: unlock.leads.focus,
      unlocked_at: unlock.created_at
    }));
  } catch (error) {
    console.error('Error fetching recent unlocks:', error);
    throw error;
  }
}