import React from 'react';
import { cn } from '../../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface HandDrawnSelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const HandDrawnSelectTrigger: React.FC<HandDrawnSelectTriggerProps> = ({
  children,
  className,
}) => {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};
