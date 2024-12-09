import { LucideIcon } from 'lucide-react';

export type Category = 'industry' | 'company' | 'role';

export interface Prompt {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  prompt: string;
  promptText: string;
  placeholder: string;
  category: Category;
  popularity: number;
}