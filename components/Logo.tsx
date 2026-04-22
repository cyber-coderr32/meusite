
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 'md', 
  showText = true,
  variant = 'default',
  onClick
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16 md:h-20'
  };

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm md:text-base'
  };

  const getTextColor = () => {
    if (variant === 'white') return 'text-white';
    if (variant === 'dark') return 'text-gray-900';
    return 'text-gray-900 dark:text-white';
  };

  return (
    <div 
      className={`flex items-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`${sizes[size]} aspect-square relative flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-color)" />
              <stop offset="100%" stopColor="var(--brand-hover)" />
            </linearGradient>
          </defs>
          
          <path 
            d="M82 28C75 16 62 10 48 10C25 10 8 28 8 50C8 72 25 90 48 90C62 90 75 84 82 72" 
            stroke="url(#cyber-grad)" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
        </svg>
        
        {showText && (
          <div className="absolute left-[24%] flex items-center h-full">
            <h1 className={`${textSizes[size]} font-black tracking-tighter transition-colors uppercase whitespace-nowrap leading-none`}>
              <span className="text-brand">C</span>
              <span className="text-brand">yBer</span>
              <span className={getTextColor()}>Phone</span>
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
