import { supabase } from '../lib/supabase';

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  return await response.blob();
}

export async function processAndUploadImage(imageId: string, currentUrl: string): Promise<boolean> {
  try {
    // 1. Fetch the image from the current URL
    const imageBlob = await fetchImageAsBlob(currentUrl);
    
    // Generate a unique filename
    const fileExt = imageBlob.type.split('/')[1] || 'jpg';
    const fileName = `${Date.now()}-${imageId}.${fileExt}`;

    // 2. Upload to lead_images bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lead_images')
      .upload(fileName, imageBlob, {
        contentType: imageBlob.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return false;
    }

    // 3. Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('lead_images')
      .getPublicUrl(fileName);

    // 4. Update the leads table with the new URL
    const { error: updateError } = await supabase
      .from('leads')
      .update({ 
        image_url: publicUrl,
        image_persistence: true 
      })
      .eq('id', imageId);

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error processing image:', error);
    return false;
  }
}
