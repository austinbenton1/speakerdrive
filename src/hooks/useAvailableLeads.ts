import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async (retryCount = 0) => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        setLoading(true);
        setError(null);
        const availableLeads = await fetchAvailableLeads();
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
  }, [isAuthenticated, navigate]);

  return { leads, loading, error };
}