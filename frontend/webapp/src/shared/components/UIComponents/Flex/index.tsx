import React from 'react';

type FlexProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number | string;
  wrap?: boolean;
};

const mapAlign = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};
const mapJustify = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Flex: React.FC<FlexProps> = ({align, justify, gap=0, wrap, children, style, ...props}) => (
  <div
    style={{
      display: 'flex',
      alignItems: align ? mapAlign[align] : undefined,
      justifyContent: justify ? mapJustify[justify] : undefined,
      gap: typeof gap === 'number' ? `${gap}rem` : gap,
      flexWrap: wrap ? 'wrap' : undefined,
      ...style
    }}
    {...props}
  >
    {children}
  </div>
);
