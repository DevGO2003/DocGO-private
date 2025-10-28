import { useRef, useEffect } from 'react';
import rough from 'roughjs';

interface SketchLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
}

export const SketchLine = ({
  x1,
  y1,
  x2,
  y2,
  stroke = '#000000',
  strokeWidth = 2,
  roughness = 1.5,
  className,
}: SketchLineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = Math.max(x1, x2) + strokeWidth * 2;
  const height = Math.max(y1, y2) + strokeWidth * 2;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const rc = rough.canvas(canvas);
      rc.line(x1, y1, x2, y2, {
        stroke,
        strokeWidth,
        roughness,
      });
    }
  }, [x1, y1, x2, y2, stroke, strokeWidth, roughness, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
};
