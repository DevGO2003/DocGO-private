import { HTMLAttributes } from 'react';

export interface CommonTextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  handDrawn?: boolean;
}
