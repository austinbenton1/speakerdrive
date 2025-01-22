import { supabase } from '../supabase';
import type { SpeakerLead } from '../../types';

export async function fetchLeadById(id: string): Promise<SpeakerLead | null> {
  try {
    // First get the lead data
    const { data: leadData, error: leadError } = await supabase
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
        event_name,
        event_url,
        created_at,
        event_info,
        detailed_info,
        value_profile,
        outreach_pathways,
        unlock_value,
        info_url,
        event_format,
        tooltip_industry_category,
        tooltip_event_format,
        tooltip_organization,
        tooltip_organization_type,
        tooltip_location,
        keywords,
        job_title,
        subtext,
        region,
        state,
        city
      `)
      .eq('id', id)
      .single();

    if (leadError) throw leadError;
    if (!leadData) return null;

    // Then get the unlocked lead data if it exists
    const { data: unlockedData, error: unlockedError } = await supabase
      .from('unlocked_leads')
      .select('id, pitch')
      .eq('lead_id', id)
      .single();

    if (unlockedError && unlockedError.code !== 'PGRST116') { // Ignore "no rows returned" error
      throw unlockedError;
    }

    return {
      id: leadData.id,
      unlocked_lead_id: unlockedData?.id || null,
      pitch: unlockedData?.pitch || null,
      image: leadData.image_url,
      name: leadData.lead_name,
      lead_name: leadData.lead_name,
      focus: leadData.focus,
      unlockType: leadData.unlock_type,
      leadType: leadData.lead_type,
      industry: leadData.industry,
      organization: leadData.organization,
      organizationType: leadData.organization_type,
      eventName: leadData.event_name,
      eventUrl: leadData.event_url,
      createdAt: leadData.created_at,
      eventInfo: leadData.event_info,
      detailedInfo: leadData.detailed_info,
      valueProfile: leadData.value_profile,
      outreachPathways: leadData.outreach_pathways,
      unlockValue: leadData.unlock_value,
      infoUrl: leadData.info_url,
      eventFormat: leadData.event_format,
      tooltipIndustryCategory: leadData.tooltip_industry_category,
      tooltipEventFormat: leadData.tooltip_event_format,
      tooltipOrganization: leadData.tooltip_organization,
      tooltipOrganizationType: leadData.tooltip_organization_type,
      tooltipLocation: leadData.tooltip_location,
      keywords: leadData.keywords,
      jobTitle: leadData.job_title,
      subtext: leadData.subtext,
      region: leadData.region,
      state: leadData.state,
      city: leadData.city
    };
  } catch (error) {
    console.error('Error fetching lead by ID:', error);
    throw error;
  }
}