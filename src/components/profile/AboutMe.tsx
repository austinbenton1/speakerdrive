import React from 'react';

interface AboutMeProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AboutMe({
  value,
  onChange,
  disabled = false
}: AboutMeProps) {
  // Local state for the about me text
  const [localValue, setLocalValue] = React.useState(value);

  // Update local state when props change
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disabled) {
      setLocalValue(e.target.value);
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        About Me
        <span className="ml-2 text-sm font-normal text-gray-500">
          (Brief description of yourself)
        </span>
      </h3>
      <textarea
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Describe yourself and your expertise..."
        className={`
          w-full min-h-[120px] p-3 border rounded-lg
          placeholder:text-gray-400
          ${disabled ? 'cursor-not-allowed opacity-75' : ''}
          ${
            disabled
              ? 'bg-gray-50'
              : 'bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }
        `}
      />
    </div>
  );
}
