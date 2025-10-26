import { useRef, useEffect } from 'react';
import { createRoughCanvas, drawRoughCircle } from '@shared/lib/roughUtils';

interface SketchCircleProps {
  diameter: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
}

export const SketchCircle = ({
  diameter,
  fill = 'transparent',
  stroke = '#000000',
  strokeWidth = 2,
  roughness = 1.5,
  className,
}: SketchCircleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = diameter + strokeWidth * 2;
  const center = size / 2;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = size;

      const rc = createRoughCanvas(canvas);
      drawRoughCircle(rc, center, center, diameter, {
        fill,
        stroke,
        strokeWidth,
        roughness,
      });
    }
  }, [diameter, fill, stroke, strokeWidth, roughness, size, center]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
    />
  );
};
