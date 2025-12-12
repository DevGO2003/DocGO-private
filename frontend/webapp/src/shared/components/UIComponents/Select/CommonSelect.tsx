import { forwardRef, useRef, useEffect, useState, SelectHTMLAttributes } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonIcon } from '../Icon/CommonIcon';

interface CommonSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const CommonSelect = forwardRef<HTMLSelectElement, CommonSelectProps>(
  ({ className, label, error, helperText, options, value, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);
    const [isOpen, setIsOpen] = useState(false);

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
        
        // Draw hand-drawn select border
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

    // Animate chevron on open/close
    useEffect(() => {
      const chevron = containerRef.current?.querySelector('[data-chevron]');
      if (chevron) {
        anime({
          targets: chevron,
          rotate: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    }, [isOpen]);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            ref={labelRef}
            className="block text-sm font-medium" style={{ color: '#374151' }} >
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
          <select
            ref={ref}
            value={value}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            className={`relative w-full px-4 py-3 pr-10 bg-transparent focus:outline-none appearance-none cursor-pointer ${className || ''}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div data-chevron className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center" style={{ color: '#4b5563' }} >
            <CommonIcon name="chevron-down" size={20} />
          </div>
        </div>
        {error && (
          <p
            ref={errorRef}
            className="text-sm overflow-hidden" style={{ color: '#ef4444' }} >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm" style={{ color: '#6b7280' }} >{helperText}</p>
        )}
      </div>
    );
  }
);

CommonSelect.displayName = 'CommonSelect';
