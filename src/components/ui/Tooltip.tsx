import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayShow?: number;
  delayHide?: number;
}

export function Tooltip({ 
  children, 
  content, 
  side = 'right',
  delayShow = 0,
  delayHide = 150
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();
  const [tooltipSide, setTooltipSide] = useState(side);

  const clearTimeouts = () => {
    if (showTimeoutRef.current) window.clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
  };

  const updatePosition = () => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
    let left = triggerRect.right + 8; // Position 8px to the right of the trigger
    let actualSide = tooltipSide;

    // Prevent tooltip from going off screen
    if (left + tooltipRect.width > viewportWidth) {
      left = triggerRect.left - tooltipRect.width - 8;
    }

    if (top < 0) {
      top = 8;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    // Update position and side
    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    clearTimeouts();
    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delayShow);
  };

  const handleMouseLeave = () => {
    clearTimeouts();
    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed z-[100] bg-white text-gray-900 text-sm rounded-lg shadow-lg overflow-hidden animate-fade-in text-left border border-gray-200/60 min-w-[200px]"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {content}
        </div>
      )}
    </div>
  );
}