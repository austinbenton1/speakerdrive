import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setError('Unable to connect to the database. Please check your internet connection.');
          return;
        }

        setLoading(true);
        setError(null);
        const availableLeads = await fetchAvailableLeads();
        setLeads(availableLeads);
      } catch (err) {
        console.error('Error loading available leads:', err);
        setError('Failed to load available leads. Please try refreshing the page.');
        setLeads([]); // Reset leads on error
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [isAuthenticated, navigate]);

  return { leads, loading, error };
}