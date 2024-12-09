import React from 'react';
import type { Category } from '../../types/intel';

interface CategoryPillProps {
  category: Category;
}

const colors: Record<Category, string> = {
  industry: 'bg-emerald-100 text-emerald-700',
  company: 'bg-purple-100 text-purple-700',
  role: 'bg-blue-100 text-blue-700',
};

const categoryNames: Record<Category, string> = {
  industry: 'Industry Intel',
  company: 'Company Intel',
  role: 'Role Intel',
};

export default function CategoryPill({ category }: CategoryPillProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[category]}`}>
      {categoryNames[category]}
    </span>
  );
}