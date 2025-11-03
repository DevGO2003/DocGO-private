import { forwardRef, useRef, useEffect, InputHTMLAttributes } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';

interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const CommonInput = forwardRef<HTMLInputElement, CommonInputProps>(
  ({ className, label, error, helperText, value, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);

    const drawCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        if (width === 0 || height === 0) return;
        
        canvas.width = width;
        canvas.height = height;

        const rc = createRoughCanvas(canvas);
        
        // Draw hand-drawn input border
        drawRoughRect(rc, 5, 5, width - 10, height - 10, {
          stroke: error ? '#ef4444' : '#94a3b8',
          strokeWidth: 2,
          roughness: 1.5,
          fill: '#ffffff',
          fillStyle: 'solid',
        });
      }
    };

    useEffect(() => {
      drawCanvas();
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }, [error, value]);

    // Animate label on mount
    useEffect(() => {
      if (labelRef.current) {
        anime.set(labelRef.current, {
          opacity: 0,
          translateX: -10,
        });
        anime({
          targets: labelRef.current,
          opacity: 1,
          translateX: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    }, [label]);

    // Animate error message
    useEffect(() => {
      if (errorRef.current) {
        if (error) {
          anime.set(errorRef.current, {
            opacity: 0,
            height: 0,
          });
          anime({
            targets: errorRef.current,
            opacity: 1,
            height: 'auto',
            duration: 300,
            easing: 'easeOutQuad',
          });
        } else {
          anime({
            targets: errorRef.current,
            opacity: 0,
            height: 0,
            duration: 300,
            easing: 'easeOutQuad',
          });
        }
      }
    }, [error]);

    return (
      <CommonFont className="w-full space-y-2">
        {label && (
          <label
            ref={labelRef}
            className="block text-sm font-medium" style={ color: '#374151' }
          >
            {label}
          </label>
        )}
        <div
          ref={containerRef}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
          <input
            ref={ref}
            value={value}
            className={`relative w-full px-4 py-3 bg-transparent focus:outline-none ${className || ''}`}
            {...props}
          />
        </div>
        {error && (
          <p
            ref={errorRef}
            className="text-sm overflow-hidden" style={ color: '#ef4444' }
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm" style={ color: '#6b7280' }>{helperText}</p>
        )}
      </CommonFont>
    );
  }
);

CommonInput.displayName = 'CommonInput';
