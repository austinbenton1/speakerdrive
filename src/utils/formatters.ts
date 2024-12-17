import { Link, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserProfile } from '../types/users';

/**
 * Formats the unlock type by removing 'Event' and 'Contact' prefixes
 */
export function formatUnlockType(unlockType: string): string {
  return unlockType.replace(/(Event|Contact)\s*/g, '');
}

/**
 * Gets the appropriate icon component based on unlock type
 */
export function getUnlockIcon(unlockType: string): LucideIcon {
  return unlockType.toLowerCase().includes('url') ? Link : Mail;
}

/**
 * Formats display name from user profile, falling back to email if needed
 */
export function formatDisplayName(user: UserProfile): string {
  if (user.display_name) return user.display_name;
  
  // Format email as fallback
  return user.email
    .split('@')[0]
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}