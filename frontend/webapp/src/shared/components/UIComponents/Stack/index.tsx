import React from 'react';

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'vertical' | 'horizontal';
  gap?: number | string;
};

export const Stack: React.FC<StackProps> = ({direction='vertical', gap=0, children, style, ...props}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
      gap: typeof gap === 'number' ? `${gap}rem` : gap,
      ...style
    }}
    {...props}
  >
    {children}
  </div>
);
