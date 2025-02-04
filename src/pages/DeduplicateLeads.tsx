import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, Save } from 'lucide-react';
import type { Lead } from '../types/leads';
import { getUniqueLeads } from '../utils/deduplication';
import LeadsTable from '../components/leads/LeadsTable';
import { useRandomSort } from '../hooks/useRandomSort';

// Helper function to sort leads based on a field
const randomizeLeads = (leads: Lead[], field: keyof Lead, ascending: boolean): Lead[] => {
  return [...leads].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (!aVal && !bVal) return 0;
    if (!aVal) return ascending ? 1 : -1;
    if (!bVal) return ascending ? -1 : 1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ascending ? 
        aVal.localeCompare(bVal) : 
        bVal.localeCompare(aVal);
    }
    
    return ascending ? 
      (aVal < bVal ? -1 : 1) : 
      (bVal < aVal ? -1 : 1);
  });
};

export default function DeduplicateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const { sortConfig } = useRandomSort();

  // Function to fetch leads with dedup_value = 2
  const fetchDedupLeads = async () => {
    setLoading(true);
    try {
      const { data: dedupLeads, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('dedup_value', 2);

      if (fetchError) throw fetchError;
      
      const randomizedLeads = randomizeLeads(dedupLeads || [], sortConfig.field, sortConfig.ascending);
      
      setLeads(randomizedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to process all leads with deduplication
  const processAllLeads = async () => {
    setProcessing(true);
    try {
      // 1. Fetch all leads
      const { data: allLeads, error: fetchError } = await supabase
        .from('leads')
        .select('*');

      if (fetchError) throw fetchError;

      // 2. Apply deduplication
      const deduplicatedLeads = getUniqueLeads(allLeads || []);

      // 3. Apply random sorting
      const randomizedLeads = randomizeLeads(deduplicatedLeads, sortConfig.field, sortConfig.ascending);

      // 4. Format and log the JSON Unique data
      const jsonUniqueData = [];
      const processedGroups = new Map<string, boolean>();

      for (const lead of randomizedLeads) {
        const eventName = (lead.event_name || '').toLowerCase().trim();
        const organization = (lead.organization || '').toLowerCase().trim();
        const groupKey = `${eventName}|${organization}`;

        // Only process each group once
        if (!processedGroups.has(groupKey)) {
          processedGroups.set(groupKey, true);

          // Find all leads in this group
          const groupLeads = randomizedLeads.filter(l => {
            const lEventName = (l.event_name || '').toLowerCase().trim();
            const lOrg = (l.organization || '').toLowerCase().trim();
            return `${lEventName}|${lOrg}` === groupKey;
          });

          // Get unique leads for this group
          const uniqueLeads = groupLeads.filter(l => {
            if (l.unlock_type === 'Unlock Event URL') {
              // For Event URL, only the first one is unique
              return l.id === groupLeads.find(gl => gl.unlock_type === 'Unlock Event URL')?.id;
            } else if (l.unlock_type === 'Unlock Contact Email') {
              // All Contact Email leads are unique if no Event URL exists
              return !groupLeads.some(gl => gl.unlock_type === 'Unlock Event URL');
            } else if (l.unlock_type === 'Unlock Event Email') {
              // First Event Email is unique only if no Event URL or Contact Email exists
              return !groupLeads.some(gl => gl.unlock_type === 'Unlock Event URL' || gl.unlock_type === 'Unlock Contact Email') &&
                     l.id === groupLeads.find(gl => gl.unlock_type === 'Unlock Event Email')?.id;
            }
            return false;
          });

          jsonUniqueData.push({
            unique_ids: uniqueLeads.map(l => l.id),
            related: groupLeads.map(l => l.id),
            related_number: groupLeads.length
          });
        }
      }
      
      console.log('JSON Unique data:', JSON.stringify(jsonUniqueData, null, 2));
      
      // Store the JSON data for the Update button
      setJsonData(jsonUniqueData);

      // 5. Update state with processed leads
      setLeads(randomizedLeads);
    } catch (error) {
      console.error('Error processing leads:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!jsonData) return;
    
    setUpdating(true);
    try {
      // Update dedup values in chunks
      const chunkSize = 20;
      for (let i = 0; i < jsonData.length; i += chunkSize) {
        const chunk = jsonData.slice(i, i + chunkSize);
        const { error } = await supabase.rpc('update_dedup_values', {
          json_data: chunk
        });
        if (error) throw error;
      }

      // Clear the JSON data after successful update
      setJsonData(null);
      
      // Refresh the list to show updated values
      await fetchDedupLeads();
    } catch (error) {
      console.error('Error updating leads:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sortedLeads = useMemo(() => {
    return randomizeLeads(leads, sortConfig.field, sortConfig.ascending);
  }, [leads, sortConfig]);

  const handleRefresh = async () => {
    await processAllLeads();
  };

  // Initial load fetches dedup_value = 2 leads
  useEffect(() => {
    fetchDedupLeads();
  }, []);

  const handleResetFilters = () => {
    // No-op since we don't have filters in this view
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deduplicated Leads</h1>
            <p className="mt-2 text-sm text-gray-700">
              View leads with dedup_value = 2. Click Refresh List to process and view all leads with deduplication.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-3">
            <button
              onClick={handleRefresh}
              disabled={processing || updating}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                processing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              {processing ? 'Processing...' : 'Refresh List'}
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating || !jsonData || processing}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                updating || !jsonData || processing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <Save className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Saving...' : 'Save List'}
            </button>
          </div>
        </div>

        <LeadsTable
          leads={sortedLeads}
          loading={loading || processing || updating}
          onResetFilters={handleResetFilters}
          showAllEvents={false}
          uniqueCount={sortedLeads.length}
          selectedLeadType="all"
          filters={{}}
        />
      </div>
    </div>
  );
}
