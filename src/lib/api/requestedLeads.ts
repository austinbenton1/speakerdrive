import { supabase } from '../supabase';

export interface RequestedLead {
  id: string;
  user_id: string;
  lead: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestError';
  }
}

export async function submitLeadRequest(lead: string): Promise<RequestedLead> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('requested_leads')
      .insert({
        user_id: user.id,
        lead: lead.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create request');

    return data as RequestedLead;
  } catch (error) {
    console.error('Error submitting lead request:', error);
    throw new RequestError('Failed to submit lead request. Please try again.');
  }
}