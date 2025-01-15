import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { RecordedLead } from '../types/leads';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheEntry {
  data: RecordedLead[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function useUnlockedLeadsData() {
  const { user, isAuthenticated } = useAuth();
  const [recordedLeads, setRecordedLeads] = useState<RecordedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnlockedLeads = useCallback(async (userId: string) => {
    // Check cache first
    const cacheKey = `unlocked_leads_${userId}`;
    const cachedData = cache.get(cacheKey);
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setRecordedLeads(cachedData.data);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('unlocked_leads')
        .select(`
          lead_id,
          unlocked_at:created_at,
          unlocked,
          leads (
            event_name,
            focus,
            industry,
            lead_type,
            subtext,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedLeads = (data as any[])?.map(item => ({
        lead_id: item.lead_id,
        event_name: item.leads.event_name,
        focus: item.leads.focus,
        industry: item.leads.industry,
        lead_type: item.leads.lead_type,
        subtext: item.leads.subtext,
        image_url: item.leads.image_url,
        unlocked_at: item.unlocked_at,
        unlocked: item.unlocked
      })) || [];

      // Update cache
      cache.set(cacheKey, {
        data: transformedLeads,
        timestamp: now
      });

      setRecordedLeads(transformedLeads);
    } catch (err) {
      console.error('Error fetching unlocked leads:', err);
      setError('Failed to load unlocked leads');
      setRecordedLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setRecordedLeads([]);
      setLoading(false);
      return;
    }

    fetchUnlockedLeads(user.id);
  }, [isAuthenticated, user, fetchUnlockedLeads]);

  // Add subscription for real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('unlocked_leads_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'unlocked_leads',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Invalidate cache and refetch on any changes
        const cacheKey = `unlocked_leads_${user.id}`;
        cache.delete(cacheKey);
        fetchUnlockedLeads(user.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchUnlockedLeads]);

  return { recordedLeads, loading, error };
}