import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export async function uploadAvatar(file: File, oldAvatarUrl?: string | null): Promise<string> {
  try {
    // If there's an old avatar, delete it first
    if (oldAvatarUrl) {
      const oldFileName = oldAvatarUrl.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('avatars')
          .remove([oldFileName]);
      }
    }

    // Generate random filename (4-8 characters)
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4().slice(0, Math.floor(Math.random() * 5) + 4)}.${fileExt}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}