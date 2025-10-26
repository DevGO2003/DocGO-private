import { forwardRef, useRef, useEffect, HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import anime from 'animejs';

interface HandDrawnCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animated?: boolean;
  hover?: boolean;
}

export const HandDrawnCard = forwardRef<HTMLDivElement, HandDrawnCardProps>(
  ({ className, children, animated = true, hover = true, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        const rc = createRoughCanvas(canvas);
        
        // Draw hand-drawn card border
        drawRoughRect(rc, 5, 5, width - 10, height - 10, {
          stroke: '#cbd5e1',
          strokeWidth: 2,
          roughness: 1.5,
          fill: '#ffffff',
          fillStyle: 'solid',
        });

        // Draw animation
        if (animated) {
          anime({
            targets: canvas,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutQuad',
          });
        }
      }
    }, [animated]);

    return (
      <motion.div
        ref={containerRef}
        className={`relative ${className || ''}`}
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        whileHover={hover ? { y: -5 } : undefined}
        transition={{ duration: 0.3 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        <div ref={ref} className="relative p-6">
          {children}
        </div>
      </motion.div>
    );
  }
);

HandDrawnCard.displayName = 'HandDrawnCard';

// Card subcomponents
export const HandDrawnCardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
    className={`mb-4 ${className}`}
  >
    {children}
  </motion.div>
);

export const HandDrawnCardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h3>
);

export const HandDrawnCardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const HandDrawnCardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className={`mt-4 ${className}`}
  >
    {children}
  </motion.div>
);
