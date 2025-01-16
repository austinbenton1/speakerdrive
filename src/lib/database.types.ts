export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          user_type: 'Admin' | 'Client'
          user_role: string
          created_at: string
          updated_at: string
          email_provider: string | null
          email_setup_completed: boolean
          services: string[] | null
          industries: string[] | null
          avatar_url: string | null
          random_lead_sort: { field: string; ascending: boolean } | null
          random_lead_sort_date: string | null // ISO string
        }
        Insert: {
          id?: string
          email: string
          user_type?: 'Admin' | 'Client'
          user_role?: string
          created_at?: string
          updated_at?: string
          email_provider?: string | null
          email_setup_completed?: boolean
          services?: string[] | null
          industries?: string[] | null
          avatar_url?: string | null
          random_lead_sort?: { field: string; ascending: boolean } | null
          random_lead_sort_date?: string | null
        }
        Update: {
          id?: string
          email?: string
          user_type?: 'Admin' | 'Client'
          user_role?: string
          created_at?: string
          updated_at?: string
          email_provider?: string | null
          email_setup_completed?: boolean
          services?: string[] | null
          industries?: string[] | null
          avatar_url?: string | null
          random_lead_sort?: { field: string; ascending: boolean } | null
          random_lead_sort_date?: string | null
        }
      }
    }
    Enums: {
      user_type: 'Admin' | 'Client'
    }
  }
}