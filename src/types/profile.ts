import { z } from 'zod';

export const profileSchema = z.object({
  // Auth metadata
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  
  // Profile data
  services: z.array(z.string()),
  industries: z.array(z.string()),
  transformation: z.string().optional(),
  email_signature: z.string().optional(),
  avatar_url: z.string().optional()
});

export type Profile = z.infer<typeof profileSchema>;

export interface ProfileUpdateResponse {
  error: Error | null;
  data?: Profile;
}