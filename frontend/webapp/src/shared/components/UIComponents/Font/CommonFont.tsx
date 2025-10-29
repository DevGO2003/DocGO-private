import React, { useEffect, forwardRef } from 'react';

export interface CommonFontProps extends React.HTMLAttributes<HTMLDivElement> {
  fontHref?: string;
  fontFamily?: string;
}

const DEFAULT_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap';
const DEFAULT_FONT_FAMILY = '"Patrick Hand", "Caveat", "Shadows Into Light", "Comic Sans MS", cursive';

function ensureFontLink(href: string) {
  if (typeof document === 'undefined') return;
  const id = `ui-hand-font-${btoa(href).replace(/=/g, '')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const CommonFont = forwardRef<HTMLDivElement, CommonFontProps>(
  ({
    fontHref = DEFAULT_FONT_HREF,
    fontFamily = DEFAULT_FONT_FAMILY,
    style,
    children,
    ...props
  }, ref) => {
    useEffect(() => {
      ensureFontLink(fontHref);
    }, [fontHref]);

    return (
      <div
        ref={ref}
        data-ui-hand-font
        style={{
          fontFamily,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CommonFont.displayName = 'CommonFont';
