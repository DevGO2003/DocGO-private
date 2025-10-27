import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnSelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnSelectItem: React.FC<HandDrawnSelectItemProps> = ({
  value,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
    >
      {children}
    </div>
  );
};
