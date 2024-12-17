import type { RecordedLead } from '../types/leads';

/**
 * Filters recorded leads to only include those that are unlocked
 * @param leads Array of recorded leads
 * @returns Array of unlocked recorded leads
 */
export function getUnlockedLeads(leads: RecordedLead[]): RecordedLead[] {
  return leads.filter(lead => lead.unlocked === true);
}

/**
 * Type for unlocked recorded leads
 * Ensures type safety by enforcing unlocked: true
 */
export type TrueRecordedLead = RecordedLead & {
  unlocked: true;
};