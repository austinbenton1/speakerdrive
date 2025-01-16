export interface UserProfile {
  id: string;
  name: string;
  display_name: string | null;
  email: string;
  services: string[];
  industries: string[];
  avatarUrl: string | null;
  quick_start_guide_tip: boolean;
  offering: string | null;
  random_lead_sort: string | null;
  random_lead_sort_date: string | null;
}