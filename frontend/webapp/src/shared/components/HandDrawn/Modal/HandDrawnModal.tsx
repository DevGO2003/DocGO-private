import React from 'react';
import { cn } from '../../../utils/cn';

export interface HandDrawnModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const HandDrawnModal: React.FC<HandDrawnModalProps> = ({
  children,
  onClose,
  className,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        'relative z-10 bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden',
        className
      )}>
        {children}
      </div>
    </div>
  );
};
