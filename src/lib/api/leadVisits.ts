import { supabase } from '../supabase';
import { LeadVisitError } from './errors';
import type { LeadVisit } from '../../types/visits';

async function checkExistingVisit(userId: string, leadId: string): Promise<LeadVisit | null> {
  const { data, error } = await supabase
    .from('unlocked_leads')
    .select()
    .eq('user_id', userId)
    .eq('lead_id', leadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    throw new LeadVisitError('Error checking existing visit', error.code);
  }

  return data as LeadVisit;
}

async function updateVisitTimestamp(userId: string, leadId: string): Promise<LeadVisit> {
  const { data, error } = await supabase
    .from('unlocked_leads')
    .update({ 
      created_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('lead_id', leadId)
    .select()
    .single();

  if (error) {
    throw new LeadVisitError('Error updating visit timestamp', error.code);
  }

  return data as LeadVisit;
}

async function createLeadVisit(userId: string, leadId: string): Promise<LeadVisit> {
  const { data, error } = await supabase
    .from('unlocked_leads')
    .insert({
      user_id: userId,
      lead_id: leadId,
    })
    .select()
    .single();

  if (error) {
    throw new LeadVisitError('Error creating new visit', error.code);
  }

  return data as LeadVisit;
}

export async function recordLeadVisit(leadId: string): Promise<LeadVisit> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new LeadVisitError('No authenticated user');

    // Check if visit exists
    const existingVisit = await checkExistingVisit(user.id, leadId);
    
    if (existingVisit) {
      // Update timestamp of existing visit
      return await updateVisitTimestamp(user.id, leadId);
    }

    // Create new visit if none exists
    return await createLeadVisit(user.id, leadId);
  } catch (error) {
    console.error('Error recording lead visit:', error);
    throw error;
  }
}