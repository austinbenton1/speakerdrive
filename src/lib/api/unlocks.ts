import { supabase } from '../supabase';

export interface UnlockLeadError {
  message: string;
  code?: string;
}

export async function unlockLead(leadId: string): Promise<{ error: UnlockLeadError | null }> {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw { message: 'Authentication error', code: 'AUTH_ERROR' };
    if (!session?.user) throw { message: 'No authenticated user', code: 'NO_USER' };

    // Check if lead is already unlocked
    const { data: existingUnlock, error: checkError } = await supabase
      .from('unlocked_leads')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('lead_id', leadId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw { message: 'Error checking unlock status', code: 'CHECK_ERROR' };
    }

    if (existingUnlock) {
      throw { message: 'Lead already unlocked', code: 'ALREADY_UNLOCKED' };
    }

    // Insert new unlock record
    const { error: insertError } = await supabase
      .from('unlocked_leads')
      .insert([
        {
          user_id: session.user.id,
          lead_id: leadId
        }
      ]);

    if (insertError) {
      throw { message: 'Failed to unlock lead', code: 'INSERT_ERROR' };
    }

    return { error: null };
  } catch (err) {
    const error = err as UnlockLeadError;
    console.error('Error unlocking lead:', error);
    return { error };
  }
}

export async function checkLeadUnlocked(leadId: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data, error } = await supabase
      .from('unlocked_leads')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('lead_id', leadId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking unlock status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking unlock status:', error);
    return false;
  }
}