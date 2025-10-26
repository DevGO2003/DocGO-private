import { ReactNode } from 'react';
import { cn } from '@shared/lib/utils';

interface StackProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Stack = ({
  children,
  direction = 'column',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  className,
}: StackProps) => {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        direction === 'row' ? `space-x-${spacing}` : `space-y-${spacing}`,
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};
