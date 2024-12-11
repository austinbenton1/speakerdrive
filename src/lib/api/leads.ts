import { supabase } from '../supabase';
import type { SpeakerLead } from '../../types';

export async function fetchLeadById(id: string): Promise<SpeakerLead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        image_url,
        lead_name,
        focus,
        lead_type,
        unlock_type,
        industry,
        domain_type,
        organization,
        event_name,
        location,
        created_at,
        event_info,
        detailed_info,
        unlock_value
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      image: data.image_url,
      name: data.lead_name,
      focus: data.focus,
      unlockType: data.unlock_type,
      industryCategory: data.industry,
      domainType: data.domain_type,
      leadType: data.lead_type,
      isUnlocked: false,
      eventName: data.event_name,
      organization: data.organization,
      location: data.location,
      addedDate: data.created_at,
      eventInfo: data.event_info,
      detailedInfo: data.detailed_info,
      unlockValue: data.unlock_value
    };
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}