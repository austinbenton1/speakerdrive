export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  user_type: string;
  created_at: string;
  avatar_url: string | null;
  banned: boolean;
  banned_at: string | null;
  banned_by: string | null;
  banned_by_display_name?: string | null;
}

export interface UserFilters {
  searchTerm: string;
  role: 'all' | 'Admin' | 'Client';
}