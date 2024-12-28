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
        organization_type,
        event_name,
        event_url,
        location,
        created_at,
        event_info,
        detailed_info,
        value_profile,
        outreach_pathways,
        unlock_value,
        info_url,
        event_format,
        tooltip_location,
        tooltip_industry_category,
        tooltip_event_format,
        tooltip_organization,
        tooltip_organization_type
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
      eventUrl: data.event_url,
      organization: data.organization,
      organizationType: data.organization_type,
      location: data.location,
      addedDate: data.created_at,
      eventInfo: data.event_info,
      detailedInfo: data.detailed_info,
      valueProfile: data.value_profile,
      outreachPathways: data.outreach_pathways,
      unlockValue: data.unlock_value,
      infoUrl: data.info_url,
      eventFormat: data.event_format,
      tooltipLocation: data.tooltip_location,
      tooltipIndustryCategory: data.tooltip_industry_category,
      tooltipEventFormat: data.tooltip_event_format,
      tooltipOrganization: data.tooltip_organization,
      tooltipOrganizationType: data.tooltip_organization_type
    };
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}