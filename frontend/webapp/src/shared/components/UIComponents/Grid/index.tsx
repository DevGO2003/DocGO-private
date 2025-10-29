import React, { useEffect, useState } from 'react';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

const breakpoints: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type GridCols = number | Partial<Record<Breakpoint, number>>;

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: GridCols;
  gap?: number | string;
};

function resolveCols(cols: GridCols | undefined, width: number): number {
  if (!cols) return 1;
  if (typeof cols === 'number') return cols;
  // Choose the largest breakpoint that is <= current width and has a value defined
  const order: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'base'];
  for (const bp of order) {
    const min = breakpoints[bp];
    if (width >= min && typeof cols[bp] === 'number') {
      return cols[bp] as number;
    }
  }
  return cols.base ?? 1;
}

export const Grid: React.FC<GridProps> = ({ cols = 1, gap = 0, style, children, ...props }) => {
  const [colCount, setColCount] = useState<number>(1);

  useEffect(() => {
    const handler = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      setColCount(resolveCols(cols, width));
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [cols]);

  const computeGap = () => {
    if (typeof gap === 'number') return `${gap}rem`;
    // if string looks like a number, treat as rem for consistency
    if (/^\d+(\.\d+)?$/.test(gap)) return `${gap}rem`;
    return gap;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        gap: computeGap(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
