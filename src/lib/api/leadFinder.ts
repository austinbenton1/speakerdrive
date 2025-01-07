import { supabase } from '../supabase';
import type { Lead } from '../../types';

export async function fetchAvailableLeads(): Promise<Lead[]> {
  try {
    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Get current user's unlocked leads
    const { data: unlockedLeads, error: unlockedError } = await supabase
      .from('unlocked_leads')
      .select('lead_id')
      .eq('user_id', user.id)
      .eq('unlocked', true);

    if (unlockedError) throw unlockedError;

    // Get all leads except those that are already unlocked
    const { data: availableLeads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        image_url,
        lead_name,
        focus,
        lead_type,
        unlock_type,
        industry,
        organization,
        event_info,
        event_name,
        event_format,
        job_title,
        subtext,
        past_speakers_events,
        region,
        state,
        city
      `)
      .not('id', 'in', `(${(unlockedLeads || []).map(ul => ul.lead_id).join(',')})`);

    if (leadsError) throw leadsError;

    // Map and return the available leads
    return (availableLeads || []).map(lead => ({
      id: lead.id,
      image_url: lead.image_url,
      lead_name: lead.lead_name,
      focus: lead.focus,
      lead_type: lead.lead_type,
      unlock_type: lead.unlock_type,
      industry: lead.industry,
      organization: lead.organization,
      event_info: lead.event_info,
      event_name: lead.event_name,
      event_format: lead.event_format,
      job_title: lead.job_title,
      subtext: lead.subtext,
      past_speakers_events: lead.past_speakers_events,
      region: lead.region,
      state: lead.state,
      city: lead.city
    }));
  } catch (error) {
    throw error;
  }
}