import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableLeads } from '../lib/api/leadFinder';
import { useAuth } from './useAuth';
import type { Lead } from '../types';
import { checkSupabaseConnection } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAvailableLeads() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [allLeadsLoaded, setAllLeadsLoaded] = useState(false);
  const [isLoadingInitialBatch, setIsLoadingInitialBatch] = useState(true);
  const isInitialMount = useRef(true);
  const hasLoadedInitialBatch = useRef(false);
  const currentPage = useRef(1);

  useEffect(() => {
    const loadLeads = async (retryCount = 0) => {
      try {
        if (!isAuthenticated || !user) {
          navigate('/login');
          return;
        }

        // Skip loading if we already have initial batch
        if (hasLoadedInitialBatch.current && leads.length > 0) {
          setIsLoadingInitialBatch(false);
          return;
        }

        // Check connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        setLoading(true);
        setIsLoadingInitialBatch(true);
        setError(null);
        setAllLeadsLoaded(false);
        
        // Get total leads count first
        const { data, error: countError } = await supabase.rpc('count_total_leads');
        if (countError) {
          throw countError;
        }
        setTotalLeads(data);
        
        // Pass setLeads as the callback for remaining leads
        const initialLeads = await fetchAvailableLeads(user.id, (batchLeads) => {
          // Append new leads while preserving the order of existing leads
          if (!Array.isArray(batchLeads)) {
            console.error('Expected batchLeads to be an array but got:', typeof batchLeads);
            return;
          }
          
          setLeads(prevLeads => {
            const existingLeadIds = new Set(prevLeads.map(lead => lead.id));
            const newFilteredLeads = batchLeads.filter(lead => !existingLeadIds.has(lead.id));
            return [...prevLeads, ...newFilteredLeads];
          });

          if (batchLeads.length === 0) {
            setAllLeadsLoaded(true);
          }
        });
        setLeads(initialLeads);
        hasLoadedInitialBatch.current = true;
        setIsLoadingInitialBatch(false);
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
        setIsLoadingInitialBatch(false);
      }
    };

    loadLeads();
  }, [isAuthenticated, user, navigate]);

  return { leads, loading, error, totalLeads, allLeadsLoaded, isLoadingInitialBatch };
}