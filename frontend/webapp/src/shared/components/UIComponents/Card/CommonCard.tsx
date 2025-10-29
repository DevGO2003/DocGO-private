import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@shared/lib/utils';
import {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './Card.types';
import { cardStyles } from './Card.styles';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...rest }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const el = containerRef.current;
    const canvas = canvasRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 || height === 0) return;
    canvas.width = width;
    canvas.height = height;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 6, 6, width - 12, height - 12, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.5,
    });
  };

  useEffect(() => {
    drawCanvas();
    const t = setTimeout(drawCanvas, 100);
    return () => clearTimeout(t);
  }, [className, children]);

  const setRefs = (node: HTMLDivElement | null) => {
    (containerRef as any).current = node;
    if (typeof ref === 'function') {
      (ref as (instance: HTMLDivElement | null) => void)(node);
    } else if (ref) {
      (ref as any).current = node;
    }
  };

  return (
    <CommonFont ref={setRefs as any} className={cn('relative', cardStyles.card, className)} {...rest}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </CommonFont>
  );
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardStyles.header, className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(cardStyles.title, className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(cardStyles.description, className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardStyles.content, className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardStyles.footer, className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
