import { LeadVisit } from '../types/visits';

export function formatVisitDate(visit: LeadVisit): string {
  return new Date(visit.created_at).toLocaleString();
}

export function sortVisitsByDate(visits: LeadVisit[]): LeadVisit[] {
  return [...visits].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getVisitStats(visits: LeadVisit[]): {
  totalVisits: number;
  lastVisit: Date | null;
  firstVisit: Date | null;
} {
  if (!visits.length) {
    return {
      totalVisits: 0,
      lastVisit: null,
      firstVisit: null
    };
  }

  const sortedVisits = sortVisitsByDate(visits);
  
  return {
    totalVisits: visits.length,
    lastVisit: new Date(sortedVisits[0].created_at),
    firstVisit: new Date(sortedVisits[sortedVisits.length - 1].created_at)
  };
}