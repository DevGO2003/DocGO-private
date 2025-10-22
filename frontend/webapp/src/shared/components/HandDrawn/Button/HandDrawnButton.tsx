import { forwardRef, useRef, useEffect, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import anime from 'animejs';

interface HandDrawnButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  animated?: boolean;
}

export const HandDrawnButton = forwardRef<HTMLButtonElement, HandDrawnButtonProps>(
  ({ className, variant = 'primary', isLoading, animated = true, children, disabled, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Set canvas size based on container
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        const rc = createRoughCanvas(canvas);
        
        // Draw hand-drawn button border
        const fillColors = {
          primary: '#4A90E2',
          secondary: '#7B68EE',
          outline: 'transparent',
        };

        drawRoughRect(rc, 5, 5, width - 10, height - 10, {
          fill: fillColors[variant],
          fillStyle: variant === 'outline' ? 'solid' : 'hachure',
          stroke: variant === 'outline' ? '#4A90E2' : '#333',
          strokeWidth: 2,
          roughness: 1.5,
        });

        // Animate if enabled
        if (animated) {
          anime({
            targets: canvas,
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad',
          });
        }
      }
    }, [variant, animated]);

    const handleHover = () => {
      if (canvasRef.current && animated) {
        anime({
          targets: canvasRef.current,
          scale: 1.02,
          duration: 200,
          easing: 'easeOutQuad',
        });
      }
    };

    const handleHoverEnd = () => {
      if (canvasRef.current && animated) {
        anime({
          targets: canvasRef.current,
          scale: 1,
          duration: 200,
          easing: 'easeOutQuad',
        });
      }
    };

    const textColors = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary',
    };

    return (
      <motion.div
        ref={containerRef}
        className="relative inline-block"
        whileHover={animated ? { scale: 1.02 } : undefined}
        whileTap={animated ? { scale: 0.98 } : undefined}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <button
          ref={ref}
          className={`relative px-6 py-3 font-medium ${textColors[variant]} ${className || ''}`}
          disabled={disabled || isLoading}
          onMouseEnter={handleHover}
          onMouseLeave={handleHoverEnd}
          {...props}
        >
          {isLoading ? 'Loading...' : children}
        </button>
      </motion.div>
    );
  }
);

HandDrawnButton.displayName = 'HandDrawnButton';
