import { supabase } from './supabase';

export async function updateUserProfile(data: Record<string, any>) {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No active session');

    // Retry mechanism for auth operations
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        // Update user data
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...data,
            updated_at: new Date().toISOString()
          }
        });

        if (!updateError) {
          return { error: null };
        }

        lastError = updateError;
      } catch (err) {
        lastError = err;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      retryCount++;
    }

    throw lastError;
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
}