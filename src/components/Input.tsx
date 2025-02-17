import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
  showValidation?: boolean;
  isValid?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    icon: Icon,
    helperText,
    showValidation = false,
    isValid = false,
    className = '',
    value,
    onChange,
    ...props
  }, ref) => {
    return (
      <div>
        <label htmlFor={props.id} className="block text-[15px] font-medium text-gray-900 mb-2">
          {label}
        </label>
        <div className="mt-1 relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
              <Icon
                className={`h-5 w-5 ${
                  error
                    ? 'text-red-400'
                    : isValid
                    ? 'text-emerald-500'
                    : 'text-gray-400/75'
                }`}
              />
            </div>
          )}
          {showValidation && isValid && !error && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Check className="h-5 w-5 text-emerald-500" />
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
          <input
            {...props}
            ref={ref}
            value={value}
            onChange={onChange}
            className={`
              block w-full min-w-0
              ${Icon ? 'pl-10' : 'pl-4'} ${
              isValid || error ? 'pr-10' : 'pr-4'
            } py-2
              border rounded-lg bg-white
              ${
                error
                  ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                  : isValid
                  ? 'border-emerald-300 focus:ring-emerald-500/10 focus:border-emerald-500'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 focus:ring-2'
              }
              placeholder:text-gray-400
              focus:outline-none focus:ring-opacity-20
              focus:bg-gray-50/75
              disabled:bg-gray-50/75 disabled:text-gray-500
              text-[15px]
              ${className}
            `}
          />
        </div>
        {helperText && !error && (
          <p className="mt-1 text-[13px] text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-[13px] text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
