/**
 * Rough.js Utility Functions
 * Helper functions for working with rough.js hand-drawn graphics
 */

import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options } from 'roughjs/bin/core';

/**
 * Create a rough canvas instance
 */
export const createRoughCanvas = (canvas: HTMLCanvasElement): RoughCanvas => {
  return rough.canvas(canvas);
};

/**
 * Draw a hand-drawn rectangle
 */
export const drawRoughRect = (
  rc: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: Options
) => {
  return rc.rectangle(x, y, width, height, {
    roughness: 1.5,
    strokeWidth: 2,
    fill: 'transparent',
    fillStyle: 'hachure',
    ...options,
  });
};

/**
 * Draw a hand-drawn circle
 */
export const drawRoughCircle = (
  rc: RoughCanvas,
  x: number,
  y: number,
  diameter: number,
  options?: Options
) => {
  return rc.circle(x, y, diameter, {
    roughness: 1.5,
    strokeWidth: 2,
    fill: 'transparent',
    ...options,
  });
};

/**
 * Draw a hand-drawn ellipse
 */
export const drawRoughEllipse = (
  rc: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: Options
) => {
  return rc.ellipse(x, y, width, height, {
    roughness: 1.5,
    strokeWidth: 2,
    fill: 'transparent',
    ...options,
  });
};

/**
 * Draw a hand-drawn line
 */
export const drawRoughLine = (
  rc: RoughCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options?: Options
) => {
  return rc.line(x1, y1, x2, y2, {
    roughness: 1.5,
    strokeWidth: 2,
    ...options,
  });
};

/**
 * Draw a hand-drawn polygon
 */
export const drawRoughPolygon = (
  rc: RoughCanvas,
  points: [number, number][],
  options?: Options
) => {
  return rc.polygon(points, {
    roughness: 1.5,
    strokeWidth: 2,
    fill: 'transparent',
    fillStyle: 'hachure',
    ...options,
  });
};

/**
 * Draw a hand-drawn path
 */
export const drawRoughPath = (
  rc: RoughCanvas,
  path: string,
  options?: Options
) => {
  return rc.path(path, {
    roughness: 1.5,
    strokeWidth: 2,
    ...options,
  });
};

/**
 * Common rough.js options presets
 */
export const roughPresets = {
  // Subtle hand-drawn effect
  subtle: {
    roughness: 0.5,
    strokeWidth: 1,
  },
  // Normal hand-drawn effect
  normal: {
    roughness: 1.5,
    strokeWidth: 2,
  },
  // Strong hand-drawn effect
  strong: {
    roughness: 2.5,
    strokeWidth: 3,
  },
  // Sketch style
  sketch: {
    roughness: 2,
    strokeWidth: 2,
    fillStyle: 'cross-hatch' as const,
  },
  // Solid fill
  solid: {
    roughness: 1.5,
    strokeWidth: 2,
    fillStyle: 'solid' as const,
  },
} as const;

/**
 * Get rough options based on style
 */
export const getRoughOptions = (
  style: keyof typeof roughPresets,
  overrides?: Options
): Options => {
  return {
    ...roughPresets[style],
    ...overrides,
  };
};
