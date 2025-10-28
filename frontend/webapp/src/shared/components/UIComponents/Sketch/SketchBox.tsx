import { useRef, useEffect } from 'react';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';

interface SketchBoxProps {
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
}

export const SketchBox = ({
  width,
  height,
  fill = 'transparent',
  stroke = '#000000',
  strokeWidth = 2,
  roughness = 1.5,
  className,
}: SketchBoxProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 0, 0, width, height, {
        fill,
        stroke,
        strokeWidth,
        roughness,
      });
    }
  }, [width, height, fill, stroke, strokeWidth, roughness]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
};
