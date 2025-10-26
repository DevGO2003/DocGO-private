import { forwardRef, useRef, useEffect, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';

interface HandDrawnInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const HandDrawnInput = forwardRef<HTMLInputElement, HandDrawnInputProps>(
  ({ className, label, error, helperText, value, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const drawCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        if (width === 0 || height === 0) return; // Skip if container not ready
        
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
      // Initial draw
      drawCanvas();
      
      // Retry after a short delay for autofill
      const timer = setTimeout(drawCanvas, 100);
      
      return () => clearTimeout(timer);
    }, [error, value]);

    return (
      <div className="w-full space-y-2">
        {label && (
          <motion.label
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </motion.label>
        )}
        <motion.div
          ref={containerRef}
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

HandDrawnInput.displayName = 'HandDrawnInput';
