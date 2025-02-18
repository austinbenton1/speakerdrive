import React from 'react';
import minimalLogo from '../../assets/speakerdrive-mini-v2.png';

interface LeadImageProps {
  src: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LeadImage({ src, alt = 'Lead', size = 'md', className = '' }: LeadImageProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <img
      src={src || minimalLogo}
      alt={alt}
      className={`rounded-full object-cover bg-white ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = minimalLogo;
      }}
    />
  );
}
