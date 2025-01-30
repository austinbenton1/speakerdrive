import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import { useUnlockedLeadIds } from './useUnlockedLeadIds';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { leadIds: unlockedLeadIds, loading: idsLoading } = useUnlockedLeadIds();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    const loadLeads = async (retryCount = 0) => {
      try {
        if (!isAuthenticated || !user) {
          navigate('/login');
          return;
        }

        // Skip loading if we already have data
        if (hasLoadedData.current && leads.length > 0) {
          return;
        }

        // Wait for unlocked lead IDs to load
        if (idsLoading) {
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        setLoading(true);
        setError(null);
        
        const availableLeads = await fetchAvailableLeads(user.id, unlockedLeadIds);
        setLeads(availableLeads);
        hasLoadedData.current = true;
      } catch (err) {
        console.error('Error loading available leads:', err);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => loadLeads(retryCount + 1), RETRY_DELAY * Math.pow(2, retryCount));
        } else {
          setError('Failed to load leads. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [isAuthenticated, user, unlockedLeadIds, idsLoading, navigate]);

  return { leads, loading: loading || idsLoading, error };
}