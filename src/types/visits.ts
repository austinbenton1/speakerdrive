export interface LeadVisit {
  id: string;
  user_id: string;
  lead_id: string;
  created_at: string;
}

export interface VisitStats {
  total_visits: number;
  last_visit: string | null;
  first_visit: string | null;
}