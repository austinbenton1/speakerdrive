export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  user_type: 'Admin' | 'Client';
  created_at: string;
  avatar_url?: string | null;
}

export interface UserFilters {
  searchTerm: string;
  role: 'all' | 'Admin' | 'Client';
}