import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import rough from 'roughjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Rough.js utility for creating hand-drawn canvas
export const createRoughCanvas = (canvas: HTMLCanvasElement) => {
  return rough.canvas(canvas);
};

// Hand-drawn rectangle with rough.js
export const drawRoughRect = (
  rc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: any
) => {
  return rc.rectangle(x, y, width, height, {
    roughness: 2,
    strokeWidth: 2,
    fill: options?.fill || 'transparent',
    fillStyle: 'hachure',
    ...options,
  });
};

// Hand-drawn circle
export const drawRoughCircle = (
  rc: any,
  x: number,
  y: number,
  diameter: number,
  options?: any
) => {
  return rc.circle(x, y, diameter, {
    roughness: 2,
    strokeWidth: 2,
    ...options,
  });
};
