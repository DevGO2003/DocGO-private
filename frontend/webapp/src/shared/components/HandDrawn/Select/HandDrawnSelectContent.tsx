import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnSelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnSelectContent: React.FC<HandDrawnSelectContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md',
      'top-full left-0 right-0 mt-1',
      className
    )}>
      {children}
    </div>
  );
};
