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

    let top = 0;
    let left = 0;
    let actualSide = tooltipSide;

    // Calculate positions for each side
    const positions = {
      top: {
        top: triggerRect.top - tooltipRect.height - 8,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      },
      right: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.right + 8
      },
      bottom: {
        top: triggerRect.bottom + 8,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      },
      left: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.left - tooltipRect.width - 8
      }
    };

    // Check if tooltip would be cut off in preferred position
    switch (actualSide) {
      case 'top':
        if (positions.top.top < 0) {
          actualSide = 'bottom';
        }
        break;
      case 'right':
        if (positions.right.left + tooltipRect.width > viewportWidth) {
          actualSide = 'left';
        }
        break;
      case 'bottom':
        if (positions.bottom.top + tooltipRect.height > viewportHeight) {
          actualSide = 'top';
        }
        break;
      case 'left':
        if (positions.left.left < 0) {
          actualSide = 'right';
        }
        break;
    }

    // Get final position based on actual side
    const finalPosition = positions[actualSide];
    
    // Adjust horizontal position if needed
    if (finalPosition.left < 0) {
      finalPosition.left = 8;
    } else if (finalPosition.left + tooltipRect.width > viewportWidth) {
      finalPosition.left = viewportWidth - tooltipRect.width - 8;
    }

    // Adjust vertical position if needed
    if (finalPosition.top < 0) {
      finalPosition.top = 8;
    } else if (finalPosition.top + tooltipRect.height > viewportHeight) {
      finalPosition.top = viewportHeight - tooltipRect.height - 8;
    }

    // Update position and side
    setPosition(finalPosition);
    setTooltipSide(actualSide);
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
          className="fixed z-[100] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {content}
        </div>
      )}
    </div>
  );
}