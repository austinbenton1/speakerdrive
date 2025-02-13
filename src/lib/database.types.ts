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
          services: string | null
          avatar_url: string | null
          random_lead_sort: { field: string; ascending: boolean } | null
          random_lead_sort_date: string | null // ISO string
          display_name: string | null
          company: string | null
          company_role: string | null
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
          services?: string | null
          avatar_url?: string | null
          random_lead_sort?: { field: string; ascending: boolean } | null
          random_lead_sort_date?: string | null
          display_name?: string | null
          company?: string | null
          company_role?: string | null
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
          services?: string | null
          avatar_url?: string | null
          random_lead_sort?: { field: string; ascending: boolean } | null
          random_lead_sort_date?: string | null
          display_name?: string | null
          company?: string | null
          company_role?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          image_url: string | null
          lead_name: string
          focus: string | null
          lead_type: string
          unlock_type: string
          industry: string[]
          organization: string
          organization_type: string[]
          event_info: Json | null
          detailed_info: Json | null
          event_name: string | null
          event_url: string | null
          event_format: string[]
          job_title: string[]
          subtext: string | null
          past_speakers_events: string[]
          region: string
          state: string[]
          city: string[]
          keywords: string[]
          dedup_value: string
          related_leads: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          lead_name: string
          focus?: string | null
          lead_type: string
          unlock_type: string
          industry: string[]
          organization: string
          organization_type: string[]
          event_info?: Json | null
          detailed_info?: Json | null
          event_name?: string | null
          event_url?: string | null
          event_format: string[]
          job_title: string[]
          subtext?: string | null
          past_speakers_events: string[]
          region: string
          state: string[]
          city: string[]
          keywords: string[]
          dedup_value: string
          related_leads: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_url?: string | null
          lead_name?: string
          focus?: string | null
          lead_type?: string
          unlock_type?: string
          industry?: string[]
          organization?: string
          organization_type?: string[]
          event_info?: Json | null
          detailed_info?: Json | null
          event_name?: string | null
          event_url?: string | null
          event_format?: string[]
          job_title?: string[]
          subtext?: string | null
          past_speakers_events?: string[]
          region?: string
          state?: string[]
          city?: string[]
          keywords?: string[]
          dedup_value?: string
          related_leads?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}