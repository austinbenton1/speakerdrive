import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Save, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types/leads';
import { getUniqueLeads } from '../utils/deduplication';
import LeadsTable from '../components/leads/LeadsTable';
import { useRandomSort } from '../hooks/useRandomSort';
import Toast from '../components/ui/Toast';

interface ProcessingStats {
  totalRecords: number;
  processedRecords: number;
  startTime: number;
}

export default function DeduplicateLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const { sortConfig } = useRandomSort();

  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = (stats: ProcessingStats) => {
    const elapsedTime = Date.now() - stats.startTime;
    const recordsRemaining = stats.totalRecords - stats.processedRecords;
    const timePerRecord = elapsedTime / stats.processedRecords;
    const estimatedTimeRemaining = timePerRecord * recordsRemaining;
    return Math.ceil(estimatedTimeRemaining / 1000); // Convert to seconds
  };

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
      // Log start of processing
      console.log('Starting lead processing...');

      // 1. Fetch all leads
      const { data: allLeads, error: fetchError } = await supabase
        .from('leads')
        .select('*');

      if (fetchError) {
        console.error('Error fetching leads:', fetchError);
        throw new Error(`Failed to fetch leads: ${fetchError.message}`);
      }

      if (!allLeads?.length) {
        throw new Error('No leads found to process');
      }

      console.log(`Found ${allLeads.length} total leads to process`);

      // 2. Apply deduplication
      const deduplicatedLeads = getUniqueLeads(allLeads || []);
      console.log(`Deduplication complete - ${deduplicatedLeads.length} unique leads identified`);

      // 3. Apply random sorting
      const randomizedLeads = randomizeLeads(deduplicatedLeads, sortConfig.field, sortConfig.ascending);

      // 4. Format and log the JSON Unique data
      const jsonUniqueData = [];
      const processedGroups = new Map<string, boolean>();
      let totalGroups = 0;
      let totalUniqueLeads = 0;

      for (const lead of randomizedLeads) {
        const eventName = (lead.event_name || '').toLowerCase().trim();
        const organization = (lead.organization || '').toLowerCase().trim();
        const groupKey = `${eventName}|${organization}`;

        // Only process each group once
        if (!processedGroups.has(groupKey)) {
          processedGroups.set(groupKey, true);
          totalGroups++;

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

          totalUniqueLeads += uniqueLeads.length;

          jsonUniqueData.push({
            unique_ids: uniqueLeads.map(l => l.id),
            related: groupLeads.map(l => l.id),
            related_number: groupLeads.length
          });
        }
      }
      
      // Log detailed processing results
      console.log('Deduplication Results:', {
        totalGroups,
        totalUniqueLeads,
        groupDetails: jsonUniqueData.map(group => ({
          uniqueCount: group.unique_ids.length,
          relatedCount: group.related_number
        }))
      });

      // Validate JSON data structure
      const isValidData = jsonUniqueData.every(group => 
        Array.isArray(group.unique_ids) && 
        Array.isArray(group.related) && 
        typeof group.related_number === 'number' &&
        group.unique_ids.length > 0 &&
        group.related.length > 0 &&
        group.related_number > 0
      );

      if (!isValidData) {
        throw new Error('Invalid data structure generated for deduplication');
      }
      
      // Store the JSON data for the Update button
      setJsonData(jsonUniqueData);

      // 5. Update state with processed leads
      setLeads(randomizedLeads);

      setToastMessage(`Successfully processed ${totalGroups} groups with ${totalUniqueLeads} unique leads`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error processing leads:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to process leads');
      setToastType('error');
      setShowToast(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!jsonData) return;
    
    // Log the data being sent to Supabase
    console.log('Sending deduplication data to Supabase:', {
      totalGroups: jsonData.length,
      sampleGroup: jsonData[0],
      fullData: jsonData
    });

    // Close confirmation modal
    setShowConfirmation(false);

    setUpdating(true);
    setProcessingStats({
      totalRecords: jsonData.length,
      processedRecords: 0,
      startTime: Date.now()
    });

    try {
      // Update dedup values in chunks
      const chunkSize = 20;
      for (let i = 0; i < jsonData.length; i += chunkSize) {
        const chunk = jsonData.slice(i, i + chunkSize);
        
        // Update processing stats
        setProcessingStats(prev => prev ? {
          ...prev,
          processedRecords: Math.min(i + chunkSize, jsonData.length)
        } : null);
        // Log each chunk being processed
        console.log(`Processing chunk ${i/chunkSize + 1}/${Math.ceil(jsonData.length/chunkSize)}:`, {
          chunkSize: chunk.length,
          firstGroupInChunk: chunk[0],
          lastGroupInChunk: chunk[chunk.length - 1]
        });

        const { error } = await supabase.rpc('update_dedup_values', {
          json_data: chunk
        });
        if (error) {
          console.error('Supabase RPC error:', error);
          throw new Error(`Failed to update dedup values: ${error.message}`);
        }
      }

      // Show success message
      setToastMessage(`Successfully processed ${jsonData.length} records`);
      setToastType('success');
      setShowToast(true);
      console.log('Deduplication update completed successfully');

      // Clear the JSON data after successful update
      setJsonData(null);
      
      // Refresh the list to show updated values
      await fetchDedupLeads();
    } catch (error) {
      console.error('Error updating leads:', error);
      setToastMessage(`Failed to update records: ${error.message}`);
      setToastType('error');
      setShowToast(true);
    } finally {
      setUpdating(false);
      setProcessingStats(null);
    }
  };

  // Confirmation dialog for large batches
  const handleUpdateClick = () => {
    if (!jsonData) return;
    
    if (jsonData.length > 100) {
      setShowConfirmation(true);
    } else {
      handleUpdate();
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
            <p className="mt-2 text-sm text-gray-600">
              View leads with dedup_value = 2. Click Refresh List to process and view all leads with deduplication.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-3">
            <button
              onClick={handleRefresh}
              disabled={processing || updating}
              className={`inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                processing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              {processing ? 'Processing...' : 'Refresh List'}
            </button>
            <button
              onClick={handleUpdateClick}
              disabled={updating || !jsonData || processing}
              className={`inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                updating || !jsonData || processing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <Save className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Saving...' : 'Save List'}
            </button>
          </div>
        </div>

        {/* Processing Overlay */}
        {(processing || updating) && processingStats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Processing Records
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(processingStats.processedRecords / processingStats.totalRecords) * 100}%` 
                    }}
                  />
                </div>
                
                {/* Stats */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Processing {processingStats.processedRecords} of {processingStats.totalRecords} records
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated time remaining: {getEstimatedTimeRemaining(processingStats)} seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Large Update
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                You are about to process {jsonData.length} records. This operation cannot be
                undone. Are you sure you want to continue?
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        <LeadsTable
          leads={sortedLeads}
          loading={loading || processing || updating}
          onResetFilters={handleResetFilters}
          showAllEvents={false}
          uniqueCount={sortedLeads.length}
          selectedLeadType="all"
          filters={{}}
        />

        {/* Toast Notifications */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
}