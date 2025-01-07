import React from 'react';
import { ChevronRight, Sparkles, Monitor, Users, Heart, Building, GraduationCap } from 'lucide-react';

interface IndustryQuickFiltersProps {
  selectedIndustries: string[];
  onIndustrySelect: (industry: string) => void;
  onShowMore: () => void;
}

const TOP_INDUSTRIES = [
  { name: 'Technology & Media', icon: Monitor },
  { name: 'Leadership & Corporate Development', icon: Users },
  { name: 'Health, Wellness & Sustainability', icon: Heart },
  { name: 'Finance, Business & Cooperative Services', icon: Building },
  { name: 'Education & Training', icon: GraduationCap }
];

export default function IndustryQuickFilters({
  selectedIndustries,
  onIndustrySelect,
  onShowMore
}: IndustryQuickFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TOP_INDUSTRIES.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onIndustrySelect(name)}
          className={`
            inline-flex items-center px-3 py-1.5 rounded-xl text-[14px] font-medium
            transition-all duration-200 border shadow-sm
            ${selectedIndustries.includes(name)
              ? 'bg-gray-900 border-gray-800 text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }
          `}
        >
          <Icon className="w-4 h-4 mr-1.5" />
          {name}
        </button>
      ))}
      <button
        onClick={onShowMore}
        className="group inline-flex items-center px-3 py-1.5 rounded-xl text-[14px] font-medium text-[#0066FF] transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm bg-white"
      >
        <Sparkles className="w-4 h-4 mr-1.5 text-[#00B341] group-hover:text-[#00B341]/90" />
        More Categories
        <ChevronRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}