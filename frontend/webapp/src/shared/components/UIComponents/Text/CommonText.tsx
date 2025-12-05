import React, { forwardRef, useEffect, useRef } from 'react';
import anime from 'animejs';
import { CommonFont } from '../Font/CommonFont';

export interface CommonTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  handDrawn?: boolean;
}

export const CommonText = forwardRef<HTMLElement, CommonTextProps>(
  ({ as = 'p', className, children, handDrawn = false, ...props }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const setContentRef = (node: HTMLElement | null) => {
      if (typeof ref === 'function') {
        (ref as (instance: HTMLElement | null) => void)(node);
      } else if (ref) {
        (ref as any).current = node;
      }
    };

    // Animate on first mount
    useEffect(() => {
      const el = wrapperRef.current?.querySelector('[data-text-content]') as HTMLElement | null;
      if (el) {
        anime.set(el, { opacity: 0, translateY: 6 });
        anime({ targets: el, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutQuad' });
      }
      return () => {};
    }, []);

    useEffect(() => {
      // no canvas drawing for text to avoid borders/underlines
    }, [children, className, handDrawn]);

    const Component = as as any;
    
    // Block elements should use 'block', inline elements use 'inline-block'
    const isBlockElement = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(as);
    const displayClass = isBlockElement ? 'block' : 'inline-block';

    return (
      <CommonFont ref={wrapperRef as any} className={`relative ${displayClass}`}>
        <Component
          ref={setContentRef}
          data-text-content
          className={`relative z-10 no-underline ${className || ''}`}
          {...props}
        >
          {children}
        </Component>
      </CommonFont>
    );
  }
);

CommonText.displayName = 'CommonText';
