import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import { useUnlockedLeadsData } from './useUnlockedLeadsData';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheEntry {
  data: Lead[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { recordedLeads } = useUnlockedLeadsData();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async (retryCount = 0) => {
      try {
        if (!isAuthenticated || !user) {
          navigate('/login');
          return;
        }

        // Check cache first
        const cacheKey = `available_leads_${user.id}`;
        const cachedData = cache.get(cacheKey);
        const now = Date.now();

        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
          setLeads(cachedData.data);
          setLoading(false);
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        setLoading(true);
        setError(null);
        
        // Get unlocked lead IDs
        const unlockedLeadIds = recordedLeads
          .filter(lead => lead.unlocked)
          .map(lead => lead.lead_id);
        
        const availableLeads = await fetchAvailableLeads(user.id, unlockedLeadIds);
        
        // Update cache
        cache.set(cacheKey, {
          data: availableLeads,
          timestamp: now
        });

        setLeads(availableLeads);
      } catch (err) {
        console.error('Error loading available leads:', err);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            loadLeads(retryCount + 1);
          }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
          return;
        }

        setError('Failed to load available leads. Please check your connection and try refreshing the page.');
        setLeads([]); // Reset leads on error
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [isAuthenticated, navigate, user, recordedLeads]);

  return { leads, loading, error };
}