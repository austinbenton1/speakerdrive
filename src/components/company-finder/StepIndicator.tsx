import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Enter Details' },
    { number: 2, label: 'Processing' },
    { number: 3, label: 'Results' }
  ];

  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        
        return (
          <React.Fragment key={step.number}>
            {index > 0 && (
              <div 
                className={`h-0.5 w-12 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <span 
                className={`
                  mt-2 text-xs
                  ${isCurrent 
                    ? 'text-blue-600 font-medium' 
                    : isCompleted
                      ? 'text-emerald-600 font-medium'
                      : 'text-gray-500'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
