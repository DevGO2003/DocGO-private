import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@shared/lib/utils';
import { ButtonProps } from './Button.types';
import { buttonVariants } from './Button.styles';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonIcon } from '../Icon/CommonIcon';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 4, 4, width - 8, height - 8, {
        stroke: '#94a3b8',
        strokeWidth: 2,
        roughness: 1.5,
      });
    };

    useEffect(() => {
      drawCanvas();
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }, [disabled, isLoading, className, variant, size]);

    return (
      <CommonFont ref={containerRef} className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <button
          className={buttonVariants({ variant, size, className })}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading && <CommonIcon name="loading" size={16} className="mr-2" />}
          {children}
        </button>
      </CommonFont>
    );
  }
);

Button.displayName = 'Button';
