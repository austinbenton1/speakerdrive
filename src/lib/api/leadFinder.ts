import { supabase } from '../supabase';
import type { Lead } from '../../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryableRequest<T>(
  request: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request, ${retries} attempts remaining...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryableRequest(request, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

export async function fetchAvailableLeads(): Promise<Lead[]> {
  try {
    // First check if we have a valid session
    const { data: { user }, error: userError } = await retryableRequest(() => 
      supabase.auth.getUser()
    );

    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    // Get unlocked leads with retry
    const { data: unlockedLeads, error: unlockedError } = await retryableRequest(() =>
      supabase
        .from('unlocked_leads')
        .select('lead_id')
        .eq('user_id', user.id)
        .eq('unlocked', true)
    );

    if (unlockedError) throw unlockedError;

    // Build query for available leads
    const query = supabase
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
        organization_type,
        event_info,
        detailed_info,
        event_name,
        event_url,
        event_format,
        job_title,
        subtext,
        past_speakers_events,
        region,
        state,
        city,
        keywords
      `);

    // Add filter for unlocked leads if any exist
    if (unlockedLeads && unlockedLeads.length > 0) {
      query.not('id', 'in', `(${unlockedLeads.map(ul => ul.lead_id).join(',')})`);
    }

    // Get available leads with retry
    const { data: availableLeads, error: leadsError } = await retryableRequest(() => 
      query
    );

    if (leadsError) throw leadsError;

    return (availableLeads || []).map(lead => ({
      id: lead.id,
      image_url: lead.image_url,
      lead_name: lead.lead_name,
      focus: lead.focus,
      lead_type: lead.lead_type,
      unlock_type: lead.unlock_type,
      industry: lead.industry,
      organization: lead.organization,
      organization_type: lead.organization_type,
      event_info: lead.event_info,
      detailed_info: lead.detailed_info,
      event_name: lead.event_name,
      event_url: lead.event_url,
      event_format: lead.event_format,
      job_title: lead.job_title,
      subtext: lead.subtext,
      past_speakers_events: lead.past_speakers_events,
      region: lead.region,
      state: lead.state,
      city: lead.city,
      keywords: lead.keywords
    }));
  } catch (error) {
    console.error('Error in fetchAvailableLeads:', error);
    throw error;
  }
}