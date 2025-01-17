import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export async function uploadAvatar(file: File, userId: string, oldAvatarUrl?: string | null): Promise<string> {
  try {
    // Get current profile data for webhook
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

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

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Send webhook if avatar_url changed
    if (currentProfile?.avatar_url !== publicUrl) {
      const webhookPayload = {
        user: {
          id: userId,
          display_name: currentProfile?.display_name || null
        },
        changes: {
          avatar_url: publicUrl
        }
      };

      // Fire and forget webhook
      fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      }).catch(err => {
        console.error('Webhook error:', err);
      });
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}