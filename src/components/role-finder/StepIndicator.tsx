import React from 'react';
import { UserRound, Search, CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, icon: Search, label: 'Search' },
    { number: 2, icon: UserRound, label: 'Finding Role' },
    { number: 3, icon: CheckCircle, label: 'Results' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            {index > 0 && (
              <div
                className={`h-px w-12 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  mt-1 text-xs font-medium
                  ${isActive
                    ? 'text-blue-500'
                    : isCompleted
                    ? 'text-emerald-500'
                    : 'text-gray-400'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  );
}
