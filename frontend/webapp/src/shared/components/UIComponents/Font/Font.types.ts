import { HTMLAttributes } from 'react';

export interface CommonFontProps extends HTMLAttributes<HTMLDivElement> {
  fontHref?: string;
  fontFamily?: string;
}
