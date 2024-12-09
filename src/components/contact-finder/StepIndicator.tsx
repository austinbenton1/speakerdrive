import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Enter details' },
  { number: 2, label: 'We verify' },
  { number: 3, label: 'Get results' }
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 bg-white rounded-full py-3 px-6 shadow-sm">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${currentStep >= step.number 
                ? 'bg-blue-600 text-white' 
                : step.number === 2
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }
            `}>
              {step.number}
            </div>
            <span className="ml-2 text-sm text-gray-700">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-[2px] bg-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}