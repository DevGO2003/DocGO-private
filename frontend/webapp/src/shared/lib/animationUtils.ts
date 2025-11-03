/**
 * Animation Utility Functions
 * Helper functions for animations (Anime.js)
 */

import anime from 'animejs';

// Anime.js Animation Config Type
export interface AnimeConfig {
  targets?: any;
  duration?: number;
  delay?: number | ((el: any, i: number, l: number) => number);
  easing?: string;
  [key: string]: any;
}

/**
 * Create stagger animation config for lists
 */
export const createStagger = (
  targets: any,
  staggerDelay: number = 100,
  baseDelay: number = 0
): AnimeConfig => {
  return {
    targets,
    delay: anime.stagger(staggerDelay, { start: baseDelay }),
  };
};

/**
 * Create spring-like animation config (using easeOutElastic)
 */
export const createSpring = (
  targets: any,
  duration: number = 800
): AnimeConfig => {
  return {
    targets,
    duration,
    easing: 'easeOutElastic(1, .6)',
  };
};

/**
 * Create tween animation config
 */
export const createTween = (
  targets: any,
  duration: number = 300,
  easing: string = 'easeInOutQuad'
): AnimeConfig => {
  return {
    targets,
    duration,
    easing,
  };
};

/**
 * Create fade animation config
 */
export const createFadeAnimation = (
  targets: any,
  delay: number = 0,
  duration: number = 300
): AnimeConfig => {
  return {
    targets,
    opacity: [0, 1],
    delay,
    duration,
    easing: 'easeInOutQuad',
  };
};

/**
 * Create slide animation config
 */
export const createSlideAnimation = (
  targets: any,
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance: number = 20,
  delay: number = 0,
  duration: number = 400
): AnimeConfig => {
  const config: AnimeConfig = {
    targets,
    opacity: [0, 1],
    delay,
    duration,
    easing: 'easeOutQuad',
  };

  switch (direction) {
    case 'left':
      config.translateX = [-distance, 0];
      break;
    case 'right':
      config.translateX = [distance, 0];
      break;
    case 'up':
      config.translateY = [distance, 0];
      break;
    case 'down':
      config.translateY = [-distance, 0];
      break;
  }

  return config;
};

/**
 * Create scale animation config
 */
export const createScaleAnimation = (
  targets: any,
  initialScale: number = 0.8,
  delay: number = 0,
  duration: number = 300
): AnimeConfig => {
  return {
    targets,
    opacity: [0, 1],
    scale: [initialScale, 1],
    delay,
    duration,
    easing: 'easeOutQuad',
  };
};

/**
 * Create rotate animation config
 */
export const createRotateAnimation = (
  targets: any,
  initialRotate: number = -180,
  delay: number = 0,
  duration: number = 500
): AnimeConfig => {
  return {
    targets,
    opacity: [0, 1],
    rotate: [initialRotate, 0],
    delay,
    duration,
    easing: 'easeOutQuad',
  };
};

/**
 * Create hover scale animation (use with mouse events)
 */
export const createHoverScale = (
  targets: any,
  scale: number = 1.05,
  duration: number = 200
): AnimeConfig => {
  return {
    targets,
    scale,
    duration,
    easing: 'easeOutQuad',
  };
};

/**
 * Create tap/press animation (use with click events)
 */
export const createTapAnimation = (
  targets: any,
  scale: number = 0.95,
  duration: number = 100
): AnimeConfig => {
  return {
    targets,
    scale,
    duration,
    easing: 'easeOutQuad',
  };
};

/**
 * Delay helper
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Sequential animation helper
 */
export const sequential = async (
  animations: (() => Promise<void>)[],
  delayMs: number = 0
): Promise<void> => {
  for (const animation of animations) {
    await animation();
    if (delayMs > 0) {
      await delay(delayMs);
    }
  }
};

/**
 * Parallel animation helper
 */
export const parallel = async (
  animations: (() => Promise<void>)[]
): Promise<void> => {
  await Promise.all(animations.map(animation => animation()));
};

/**
 * Anime.js easing presets
 */
export const easings = {
  linear: 'linear',
  easeIn: 'easeInQuad',
  easeOut: 'easeOutQuad',
  easeInOut: 'easeInOutQuad',
  bounce: 'easeOutBounce',
  elastic: 'easeOutElastic(1, .6)',
  spring: 'spring(1, 80, 10, 0)',
} as const;

/**
 * Duration presets (in milliseconds)
 */
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1000,
} as const;
