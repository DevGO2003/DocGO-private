import { forwardRef, useRef, useEffect, InputHTMLAttributes } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';

interface CommonSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const CommonSwitch = forwardRef<HTMLInputElement, CommonSwitchProps>(
  ({ className, label, description, checked, onChange, ...props }, ref) => {
    const switchRef = useRef<HTMLInputElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const trackContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animate toggle on change
    useEffect(() => {
      if (toggleRef.current) {
        anime({
          targets: toggleRef.current,
          translateX: checked ? 24 : 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    }, [checked]);

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

    const drawCanvas = () => {
      if (!trackContainerRef.current || !canvasRef.current) return;
      const container = trackContainerRef.current;
      const canvas = canvasRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 2, 2, width - 4, height - 4, {
        stroke: checked ? '#60a5fa' : '#94a3b8',
        strokeWidth: 2,
        roughness: 1.5,
      });
    };

    useEffect(() => {
      drawCanvas();
      const timer = setTimeout(drawCanvas, 100);
      return () => clearTimeout(timer);
    }, [checked, className]);

    return (
      <CommonFont className="flex items-center space-x-3">
        <div className="relative inline-flex items-center">
          <input
            ref={ref || switchRef}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div ref={trackContainerRef} className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            />
            <div
              className={`w-14 h-8 rounded-full transition-colors cursor-pointer ${
                checked ? 'bg-blue-500' : 'bg-gray-300'
              } ${className || ''}`}
              onClick={() => {
                const input = switchRef.current;
                if (input && onChange) {
                  const syntheticEvent = {
                    target: { ...input, checked: !checked },
                    currentTarget: input,
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(syntheticEvent);
                }
              }}
            >
              <div
                ref={toggleRef}
                className="absolute top-1 left-1 rounded-full" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </div>
          </div>
        </div>
        {label && (
          <label
            ref={labelRef}
            className="text-sm font-medium cursor-pointer" style={{ color: '#374151' }}
            onClick={() => {
              const input = switchRef.current;
              if (input && onChange) {
                const syntheticEvent = {
                  target: { ...input, checked: !checked },
                  currentTarget: input,
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }
            }}
          >
            {label}
            {description && (
              <p className="text-xs mt-1" style={{ color: '#6b7280' }} >{description}</p>
            )}
          </label>
        )}
      </CommonFont>
    );
  }
);

CommonSwitch.displayName = 'CommonSwitch';
