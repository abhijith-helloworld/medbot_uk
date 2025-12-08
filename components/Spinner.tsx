// src/components/Spinner.tsx

import React from 'react';

interface SpinnerProps {

  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  screenReaderText?: string;
  className?: string;
}

export function Spinner({
  size = 'md',
  screenReaderText = 'Loading...',
  className = '',
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const baseClasses =
    'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]';

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        {screenReaderText}
      </span>
    </div>
  );
}