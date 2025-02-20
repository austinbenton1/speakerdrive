export interface UserProfile {
  id: string;
  name: string | null;
  display_name: string | null;
  email: string | null;
  services: string;
  avatarUrl: string | null;
  quick_start_guide_tip: boolean | null;
  offering: string | null;
  random_lead_sort: boolean | null;
  random_lead_sort_date: Date | null;
  website: string | null;
  is_onboarding: boolean | null;
}

export interface ProfileUpdateData {
  display_name?: string | null;
  services?: string;
  offering?: string | null;
  website?: string | null;
  is_onboarding?: boolean | null;
}

export interface ProfileResponse {
  success: boolean;
  error?: string;
}