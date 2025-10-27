import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnModalFooter: React.FC<HandDrawnModalFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'px-6 py-4 border-t border-gray-200',
      className
    )}>
      {children}
    </div>
  );
};
