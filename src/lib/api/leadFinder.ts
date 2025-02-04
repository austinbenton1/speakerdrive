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
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryableRequest(request, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

// Valid sort fields that exist in the leads table
const VALID_SORT_FIELDS = [
  'id',
  'image_url',
  'focus',
  'keywords',
  'unlock_value',
  'subtext'
] as const;

// Sorting fields and their weights
const SORT_FIELDS = [
  'id',
  'image_url',
  'focus',
  'keywords',
  'unlock_value',
  'subtext'
] as const;

function getRandomSort() {
  const randomField = VALID_SORT_FIELDS[Math.floor(Math.random() * VALID_SORT_FIELDS.length)];
  const isAscending = Math.random() < 0.5;
  return {
    field: randomField,
    ascending: isAscending
  };
}

export async function fetchAvailableLeads(userId: string, unlockedLeadIds: string[] = []): Promise<Lead[]> {
  try {
    // Get user's profile sort configuration
    const { data: profileData } = await supabase
      .from('profiles')
      .select('random_lead_sort')
      .eq('id', userId)
      .single();

    // Parse sort config or get a new random sort
    let sortConfig = profileData?.random_lead_sort;
    if (typeof sortConfig === 'string') {
      try {
        sortConfig = JSON.parse(sortConfig);
      } catch {
        sortConfig = getRandomSort();
      }
    }

    // Use the sort config or get a new random sort
    const finalSortConfig = sortConfig || getRandomSort();

    // Build query for available leads
    const selectQuery = `
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
        keywords,
        dedup_value,
        related_leads
      `;

    let query = supabase
      .from('leads')
      .select(selectQuery)
      .order('dedup_value', { ascending: false }) // Order by dedup_value desc first
      .order(finalSortConfig.field, { ascending: finalSortConfig.ascending }); // Then apply random sort

    // Get available leads with retry
    const { data: availableLeads, error: leadsError } = await retryableRequest(() => query);

    if (leadsError) throw leadsError;
    return availableLeads || [];

  } catch (err) {
    throw err;
  }
}

export async function fetchLeadNavigation(
  currentLeadId: string,
  filters?: {
    event?: string;
    tags?: string[];
    type?: string;
    industry?: string[];t
    eventFormat?: string[];
    organization?: string[];
    organizationType?: string[];
    pastSpeakers?: string[];
    searchAll?: string;
    jobTitle?: string[];
    region?: string;
    state?: string[];
    city?: string[];
    unlockType?: string;
  }
): Promise<{ nextLeadId?: string; previousLeadId?: string }> {
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

    // Build base query for available leads - matching fetchAvailableLeads exactly
    let query = supabase
      .from('leads')
      .select(`
        id,
        lead_name,
        focus,
        lead_type,
        unlock_type,
        industry,
        organization,
        organization_type,
        event_name,
        event_format,
        job_title,
        region,
        state,
        city
      `);

    // Add filter for unlocked leads if any exist
    if (unlockedLeads && unlockedLeads.length > 0) {
      query = query.not('id', 'in', `(${unlockedLeads.map(ul => `'${ul.lead_id}'`).join(',')})`);
    }

    // Apply filters if provided
    if (filters) {
      // Event name filter
      if (filters.event) {
        query = query.ilike('event_name', `%${filters.event}%`);
      }

      // Industry filter
      if (filters.industry?.length) {
        const industryConditions = filters.industry.map(industry => 
          `industry.ilike.%${industry}%`
        );
        query = query.or(industryConditions.join(','));
      }

      // Event format filter
      if (filters.eventFormat?.length) {
        const formatConditions = filters.eventFormat.map(format => 
          `event_format.ilike.%${format}%`
        );
        query = query.or(formatConditions.join(','));
      }

      // Organization filter
      if (filters.organization?.length) {
        const orgConditions = filters.organization.map(org => 
          `organization.ilike.%${org}%`
        );
        query = query.or(orgConditions.join(','));
      }

      // Organization type filter
      if (filters.organizationType?.length) {
        query = query.in('organization_type', filters.organizationType);
      }

      // Job title filter
      if (filters.jobTitle?.length) {
        const jobConditions = filters.jobTitle.map(job => 
          `job_title.ilike.%${job}%`
        );
        query = query.or(jobConditions.join(','));
      }

      // Region filter
      if (filters.region) {
        query = query.ilike('region', filters.region);
      }

      // State filter
      if (filters.state?.length) {
        const stateConditions = filters.state.map(state => 
          `state.ilike.${state}`
        );
        query = query.or(stateConditions.join(','));
      }

      // City filter
      if (filters.city?.length) {
        const cityConditions = filters.city.map(city => 
          `city.ilike.%${city}%`
        );
        query = query.or(cityConditions.join(','));
      }

      // Unlock type filter
      if (filters.unlockType) {
        query = query.eq('unlock_type', filters.unlockType);
      }

      // Search all filter
      if (filters.searchAll) {
        query = query.or(
          `lead_name.ilike.%${filters.searchAll}%,` +
          `organization.ilike.%${filters.searchAll}%,` +
          `job_title.ilike.%${filters.searchAll}%,` +
          `event_name.ilike.%${filters.searchAll}%`
        );
      }
    }

    // Get filtered leads
    const { data: leads, error: leadsError } = await retryableRequest(() => query);

    if (leadsError) throw leadsError;
    if (!leads) return {};

    // Find current lead index
    const currentIndex = leads.findIndex(lead => lead.id === currentLeadId);
    if (currentIndex === -1) return {};

    // Get next and previous IDs
    return {
      nextLeadId: currentIndex < leads.length - 1 ? leads[currentIndex + 1].id : undefined,
      previousLeadId: currentIndex > 0 ? leads[currentIndex - 1].id : undefined
    };
  } catch (error) {
    return {};
  }
}