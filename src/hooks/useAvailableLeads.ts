import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const hasLoadedInitialBatch = useRef(false);

  useEffect(() => {
    const loadLeads = async (retryCount = 0) => {
      try {
        if (!isAuthenticated || !user) {
          navigate('/login');
          return;
        }

        // Skip loading if we already have initial batch
        if (hasLoadedInitialBatch.current && leads.length > 0) {
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        setLoading(true);
        setError(null);
        
        // Pass setLeads as the callback for remaining leads
        const initialLeads = await fetchAvailableLeads(user.id, setLeads);
        setLeads(initialLeads);
        hasLoadedInitialBatch.current = true;
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
  }, [isAuthenticated, user, navigate]);

  return { leads, loading, error };
}