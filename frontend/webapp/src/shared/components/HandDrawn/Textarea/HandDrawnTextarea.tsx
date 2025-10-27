import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const HandDrawnTextarea: React.FC<HandDrawnTextareaProps> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'placeholder:text-gray-400',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};
