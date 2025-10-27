import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const HandDrawnLabel: React.FC<HandDrawnLabelProps> = ({
  children,
  required = false,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-gray-700 mb-1',
        'relative',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );
};
