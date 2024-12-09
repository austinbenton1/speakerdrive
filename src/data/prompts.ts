import {
  LineChart,
  Building2,
  Users,
  Target,
  Lightbulb,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import type { Prompt } from '../types/intel';

export const prompts: Prompt[] = [
  {
    id: 'industry-highgrowth-segments',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500',
    prompt: 'What are the high-growth customer segments in [industry]?',
    promptText: 'What are the high-growth customer segments in {placeholder}?',
    placeholder: 'industry',
    category: 'industry',
    popularity: 1,
  },
  {
    id: 'role-keeps-up',
    icon: Users,
    iconBg: 'bg-blue-500',
    prompt: 'What keeps [role] up at night?',
    promptText: 'What keeps {placeholder} up at night?',
    placeholder: 'role',
    category: 'role',
    popularity: 2,
  },
  {
    id: 'company-financial-challenges',
    icon: DollarSign,
    iconBg: 'bg-purple-500',
    prompt: "What financial challenges are impacting [company]'s revenue?",
    promptText: "What financial challenges are impacting {placeholder}'s revenue?",
    placeholder: 'company',
    category: 'company',
    popularity: 3,
  },
  {
    id: 'industry-deepdive',
    icon: LineChart,
    iconBg: 'bg-emerald-500',
    prompt: 'Provide a deep dive on [industry].',
    promptText: 'Provide a deep dive on {placeholder}.',
    placeholder: 'industry',
    category: 'industry',
    popularity: 4,
  },
  {
    id: 'company-deepdive',
    icon: Building2,
    iconBg: 'bg-purple-500',
    prompt: 'Provide a deep dive on [company].',
    promptText: 'Provide a deep dive on {placeholder}.',
    placeholder: 'company',
    category: 'company',
    popularity: 5,
  },
  {
    id: 'role-deepdive',
    icon: Users,
    iconBg: 'bg-blue-500',
    prompt: 'Provide a deep dive on [role].',
    promptText: 'Provide a deep dive on {placeholder}.',
    placeholder: 'role',
    category: 'role',
    popularity: 6,
  },
  {
    id: 'role-metrics',
    icon: Users,
    iconBg: 'bg-blue-500',
    prompt: 'What metrics are most important to [role]?',
    promptText: 'What metrics are most important to {placeholder}?',
    placeholder: 'role',
    category: 'role',
    popularity: 7,
  },
  {
    id: 'industry-overinvesting',
    icon: DollarSign,
    iconBg: 'bg-emerald-500',
    prompt: 'Where are companies in [industry] currently over-investing?',
    promptText: 'Where are companies in {placeholder} currently over-investing?',
    placeholder: 'industry',
    category: 'industry',
    popularity: 8,
  },
  {
    id: 'role-measure-success',
    icon: Target,
    iconBg: 'bg-blue-500',
    prompt: 'How does [role] measure success in their position?',
    promptText: 'How does {placeholder} measure success in their position?',
    placeholder: 'role',
    category: 'role',
    popularity: 9,
  },
  {
    id: 'role-challenges',
    icon: ShieldAlert,
    iconBg: 'bg-blue-500',
    prompt: 'What challenges does [role] face in their job?',
    promptText: 'What challenges does {placeholder} face in their job?',
    placeholder: 'role',
    category: 'role',
    popularity: 10,
  }
];