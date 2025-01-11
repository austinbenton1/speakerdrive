import React, { useState, useRef, useEffect } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  computePosition,
  type Placement
} from '@floating-ui/react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
}

export function Tooltip({ content, children, placement = 'right', className = '' }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const {
    x,
    y,
    strategy,
    refs,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <div className="relative inline-block" ref={refs.setReference}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          className={`absolute z-50 ${className}`}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
        >
          <div className="relative bg-gray-900 text-white text-xs rounded px-2.5 py-1.5 w-[300px] animate-in fade-in duration-200">
            {content}
            <div
              ref={arrowRef}
              className="absolute bg-gray-900 w-2 h-2 rotate-45 -z-10"
              style={{
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
