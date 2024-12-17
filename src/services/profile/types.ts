export interface ProfileUpdateData {
  display_name?: string;
  email?: string;
  avatar_url?: string | null;
}

export interface ProfileResponse {
  success: boolean;
  error?: string;
}