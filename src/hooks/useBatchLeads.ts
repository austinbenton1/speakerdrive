import { useEffect, useState, useRef } from 'react';
import { useAuth } from './useAuth';
import { useUnlockedLeadIds } from './useUnlockedLeadIds';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

const INITIAL_BATCH_SIZE = 100;
const BATCH_SIZE = 500;
const FETCH_INTERVAL = 5000; // 5 seconds

export function useBatchLeads() {
  const { user } = useAuth();
  const { leadIds: unlockedLeadIds, loading: idsLoading } = useUnlockedLeadIds();
  const [batchLeads, setBatchLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [stats, setStats] = useState<{
    totalLeads: number;
    batchesFetched: number;
    remainingLeads: number;
    fetchingComplete: boolean;
  }>({
    totalLeads: 0,
    batchesFetched: 0,
    remainingLeads: 0,
    fetchingComplete: false
  });

  // Use refs to store mutable values that shouldn't trigger re-renders
  const isFetching = useRef(false);
  const hasMoreLeads = useRef(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isInitialized = useRef(false);
  const allFetchedLeads = useRef<Lead[]>([]);

  // Separate effect for initialization
  useEffect(() => {
    const initializeBatchFetching = async () => {
      if (!user || idsLoading || isInitialized.current) return;

      isInitialized.current = true;
      
      try {
        // Get initial total count
        const { data: countData, error: countError } = await supabase
          .rpc('count_leads', {
            id_array: unlockedLeadIds
          });

        if (countError) throw countError;
        const totalCount = countData || 0;
        
        setStats(prev => ({
          ...prev,
          totalLeads: totalCount,
          remainingLeads: totalCount,
          fetchingComplete: false
        }));

        // Set hasMoreLeads based on total count
        hasMoreLeads.current = totalCount > 0;
      } catch (err) {
        setError('Failed to initialize batch fetching');
      }
    };

    initializeBatchFetching();
  }, [user, idsLoading, unlockedLeadIds]);

  // Separate effect for batch fetching
  useEffect(() => {
    if (!user || idsLoading || !hasMoreLeads.current || !isInitialized.current) return;

    const fetchNextBatch = async () => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Check if we need to wait
      if (timeSinceLastFetch < FETCH_INTERVAL) {
        return;
      }

      if (isFetching.current) {
        return;
      }

      try {
        isFetching.current = true;
        lastFetchTime.current = now;

        // Simple query, just get the next batch of leads
        const { data: batchData, error: batchError } = await supabase
          .from('leads')
          .select('*')
          .range(currentOffset, currentOffset + (stats.batchesFetched === 0 ? INITIAL_BATCH_SIZE : BATCH_SIZE) - 1)
          .order('id');

        if (batchError) throw batchError;

        if (batchData && batchData.length > 0) {
          // Store all fetched leads
          allFetchedLeads.current = [...allFetchedLeads.current, ...batchData];
          
          // Filter out unlocked leads for the current batch display
          const filteredBatchData = batchData.filter(lead => !unlockedLeadIds.includes(lead.id));
          setBatchLeads(prev => [...prev, ...filteredBatchData]);
          
          setCurrentOffset(prev => prev + (stats.batchesFetched === 0 ? INITIAL_BATCH_SIZE : BATCH_SIZE));
          setStats(prev => ({
            ...prev,
            batchesFetched: prev.batchesFetched + 1,
            remainingLeads: prev.totalLeads - (currentOffset + filteredBatchData.length)
          }));
        } else {
          hasMoreLeads.current = false;
          
          // Process all fetched leads one final time
          const finalFilteredLeads = allFetchedLeads.current.filter(
            lead => !unlockedLeadIds.includes(lead.id)
          );
          
          setBatchLeads(finalFilteredLeads);
          setStats(prev => ({
            ...prev,
            fetchingComplete: true,
            remainingLeads: 0
          }));

          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        }
      } catch (err) {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      } finally {
        isFetching.current = false;
        setLoading(false);
      }
    };

    // Start initial fetch
    fetchNextBatch();

    // Set up interval for subsequent fetches
    if (!intervalIdRef.current) {
      intervalIdRef.current = setInterval(fetchNextBatch, FETCH_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [user, idsLoading, unlockedLeadIds, currentOffset, stats.batchesFetched]);

  return {
    batchLeads,
    loading,
    error,
    stats
  };
}
