import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnModalHeader: React.FC<HandDrawnModalHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'px-6 py-4 border-b border-gray-200',
      className
    )}>
      {children}
    </div>
  );
};
