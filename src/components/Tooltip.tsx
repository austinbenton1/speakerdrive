import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
}

export function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      const left = triggerRect.right + 8;

      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-500 cursor-help"
      >
        <HelpCircle className="w-4 h-4" />
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-72 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="absolute w-2 h-2 transform rotate-45 bg-gray-900 -left-1 top-[calc(50%-4px)]" />
          {content}
        </div>
      )}
    </div>
  );
}