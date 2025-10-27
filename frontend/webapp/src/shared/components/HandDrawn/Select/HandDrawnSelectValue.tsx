import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnSelectValueProps {
  placeholder?: string;
  className?: string;
}

export const HandDrawnSelectValue: React.FC<HandDrawnSelectValueProps> = ({
  placeholder,
  className,
}) => {
  return (
    <span className={cn('text-gray-900', className)}>
      {placeholder}
    </span>
  );
};
