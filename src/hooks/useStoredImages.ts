import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StoredImage } from '../types/storedImage';

export function useStoredImages() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('leads')
          .select('id, image_url, lead_name, lead_type, industry, organization, image_persistence')
          .eq('image_persistence', false);

        if (fetchError) throw fetchError;
        setImages(data || []);
      } catch (err) {
        console.error('Error fetching non-persistent images:', err);
        setError('Failed to load images data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads' 
        }, 
        (payload) => {
          // Update the local data when changes occur
          fetchImages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { images, loading, error };
}
