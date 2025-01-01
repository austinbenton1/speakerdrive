import { BadgeCheck, Mail, Link } from "lucide-react";

export const leadTypes = [
  { 
    id: "all", 
    label: "All Leads", 
    icon: BadgeCheck,
    description: "See every opportunity",
    activeColor: '#64748b',
    iconColor: '#64748b',
    unlockValue: null
  },
  { 
    id: "contacts", 
    label: "Contact Emails", 
    icon: Mail,
    description: "Decision maker info",
    activeColor: '#00B0FF',
    iconColor: '#00B0FF',
    unlockValue: 'Unlock Contact Email'
  },
  { 
    id: "events", 
    label: "Event Emails", 
    icon: Mail,
    description: "Event page emails",
    activeColor: '#00B341',
    iconColor: '#00B341',
    unlockValue: 'Unlock Event Email'
  },
  { 
    id: "urls", 
    label: "Event URLs", 
    icon: Link,
    description: "Calls for speakers, etc",
    activeColor: '#00B341',
    iconColor: '#00B341',
    unlockValue: 'Unlock Event URL'
  }
] as const;

export type LeadType = typeof leadTypes[number]['id'];