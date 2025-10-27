import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnModalContent: React.FC<HandDrawnModalContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'px-6 py-4',
      className
    )}>
      {children}
    </div>
  );
};
