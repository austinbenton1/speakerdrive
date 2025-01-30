import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useUnlockedLeadIds() {
  const { user } = useAuth();
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnlockedLeadIds = async () => {
      if (!user) {
        setLeadIds([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('unlocked_leads')
          .select('lead_id')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        setLeadIds(data?.map(item => item.lead_id) || []);
      } catch (err) {
        setError('Failed to fetch unlocked lead IDs');
        setLeadIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedLeadIds();

    // Subscribe to changes in unlocked_leads
    const subscription = supabase
      .channel('unlocked_leads_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unlocked_leads',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUnlockedLeadIds();
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { leadIds, loading, error };
}
