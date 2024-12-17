export interface AuthUser {
  id: string;
  email: string;
}

export interface UserQueryResult {
  id: string;
  email: string;
  display_name: string | null;
  user_type: 'Admin' | 'Client';
  created_at: string;
  avatar_url: string | null;
}