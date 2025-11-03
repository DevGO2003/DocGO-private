import { forwardRef, LabelHTMLAttributes, useRef, useEffect } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonIcon, CommonIconProps } from '../Icon/CommonIcon';

interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  icon?: CommonIconProps['name'];
  iconSize?: number;
  iconColor?: string;
  noBorder?: boolean; // Không vẽ viền
}

export const CommonLabel = forwardRef<HTMLLabelElement, CommonLabelProps>(
  ({ className, required, error, icon, iconSize = 16, iconColor, noBorder = false, children, ...props }, ref) => {
    const labelRef = useRef<HTMLLabelElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const element = labelRef.current || ref;
      if (element && 'current' in element) {
        anime.set(element.current, {
          opacity: 0,
          translateY: -5,
        });
        anime({
          targets: element.current,
          opacity: 1,
          translateY: 0,
          duration: 300,
          easing: 'easeOutQuad',
        });
      }
    }, [children]);

    const drawCanvas = () => {
      if (noBorder || !containerRef.current || !canvasRef.current) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 2, 2, width - 4, height - 4, {
        stroke: error ? '#ef4444' : '#94a3b8',
        strokeWidth: 2,
        roughness: 1.5,
      });
    };

    useEffect(() => {
      if (!noBorder) {
        drawCanvas();
        const timer = setTimeout(drawCanvas, 100);
        return () => clearTimeout(timer);
      }
    }, [error, className, children, noBorder]);

    return (
      <CommonFont ref={containerRef as any} className={noBorder ? "inline-block" : "relative inline-block"}>
        {!noBorder && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
        )}
        <label
          ref={labelRef || ref}
          className={`${noBorder ? '' : 'relative z-10 '} flex items-center gap-2 text-sm font-medium ${
            error ? 'text-red-600' : 'text-gray-700'
          } ${className || ''}`}
          {...props}
        >
          {icon && <CommonIcon name={icon} size={iconSize} color={iconColor || (error ? '#ef4444' : '#374151')} />}
          <span>{children}</span>
          {required && <span className="ml-1" style={{ color: '#ef4444' }} >*</span>}
        </label>
      </CommonFont>
    );
  }
);

CommonLabel.displayName = 'CommonLabel';
