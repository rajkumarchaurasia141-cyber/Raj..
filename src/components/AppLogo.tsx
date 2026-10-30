import React from 'react';
import { useData } from '../context/DataContext';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
  variant?: 'circle' | 'square' | 'raw';
  onClick?: () => void;
}

export function AppLogo({
  className = 'w-9 h-9',
  size,
  alt = 'पढ़ेगा BR',
  variant = 'circle',
  onClick
}: AppLogoProps) {
  const { appConfig } = useData();

  // If admin has set a custom uploaded logo URL, use it; otherwise use the official SVG badge
  const logoSrc = appConfig?.appLogoUrl || '/app_logo.svg';

  const shapeClasses = variant === 'circle' 
    ? 'rounded-full' 
    : variant === 'square' 
    ? 'rounded-2xl' 
    : '';

  const styleObj = size ? { width: size, height: size } : undefined;

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${shapeClasses} ${className}`}
      style={styleObj}
      onClick={onClick}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-transform hover:scale-105 ${shapeClasses}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If custom URL fails, smoothly fallback to default SVG
          const target = e.currentTarget;
          if (target.src !== window.location.origin + '/app_logo.svg') {
            target.src = '/app_logo.svg';
          }
        }}
      />
    </div>
  );
}
