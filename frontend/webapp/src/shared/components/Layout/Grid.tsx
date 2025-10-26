import { ReactNode } from 'react';
import { cn } from '@shared/lib/utils';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: number;
  className?: string;
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

export const Grid = ({ children, cols = 3, gap = 4, className }: GridProps) => {
  return (
    <div
      className={cn(
        'grid',
        colsClasses[cols],
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};
