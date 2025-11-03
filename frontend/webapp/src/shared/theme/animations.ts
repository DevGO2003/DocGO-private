/**
 * Animation Presets and Constants
 * Predefined animations for consistent UI behavior (Anime.js)
 */

import { AnimeConfig } from '../lib/animationUtils';

/**
 * Common animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

/**
 * Common easing functions (Anime.js format)
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'easeInQuad',
  easeOut: 'easeOutQuad',
  easeInOut: 'easeInOutQuad',
  bounce: 'easeOutBounce',
  elastic: 'easeOutElastic(1, .6)',
} as const;

/**
 * Fade animation config factory
 */
export const createFadeConfig = (targets: any): AnimeConfig => ({
  targets,
  opacity: [0, 1],
  duration: ANIMATION_DURATION.normal,
  easing: EASING.easeInOut,
});

/**
 * Slide animation configs
 */
export const createSlideConfig = {
  fromLeft: (targets: any): AnimeConfig => ({
    targets,
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: ANIMATION_DURATION.normal,
    easing: EASING.easeOut,
  }),
  fromRight: (targets: any): AnimeConfig => ({
    targets,
    opacity: [0, 1],
    translateX: [20, 0],
    duration: ANIMATION_DURATION.normal,
    easing: EASING.easeOut,
  }),
  fromTop: (targets: any): AnimeConfig => ({
    targets,
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: ANIMATION_DURATION.normal,
    easing: EASING.easeOut,
  }),
  fromBottom: (targets: any): AnimeConfig => ({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: ANIMATION_DURATION.normal,
    easing: EASING.easeOut,
  }),
};

/**
 * Scale animation config factory
 */
export const createScaleConfig = (targets: any): AnimeConfig => ({
  targets,
  opacity: [0, 1],
  scale: [0.8, 1],
  duration: ANIMATION_DURATION.normal,
  easing: EASING.easeOut,
});

/**
 * Bounce animation config factory
 */
export const createBounceConfig = (targets: any): AnimeConfig => ({
  targets,
  opacity: [0, 1],
  scale: [0.5, 1],
  duration: ANIMATION_DURATION.slow,
  easing: EASING.elastic,
});

/**
 * Stagger animation config for lists
 */
export const createStaggerConfig = (targets: any, delay: number = 100): AnimeConfig => {
  return {
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: ANIMATION_DURATION.normal,
    delay: (_el: any, i: number) => i * delay,
    easing: EASING.easeOut,
  };
};

/**
 * Page transition config
 */
export const createPageTransitionConfig = (targets: any): AnimeConfig => ({
  targets,
  opacity: [0, 1],
  translateY: [20, 0],
  duration: ANIMATION_DURATION.normal,
  easing: EASING.easeOut,
});

/**
 * Modal/Dialog animation config factory
 */
export const createModalConfig = (targets: any): AnimeConfig => ({
  targets,
  opacity: [0, 1],
  scale: [0.9, 1],
  duration: ANIMATION_DURATION.normal,
  easing: EASING.easeOut,
});

/**
 * Hand-drawn reveal animation (for SVG paths)
 */
export const createDrawInConfig = (targets: any): AnimeConfig => ({
  targets,
  strokeDashoffset: [anime.setDashoffset, 0],
  opacity: [0, 1],
  duration: 1500,
  easing: 'easeInOutQuad',
});

/**
 * Hover scale animation (use with mouseenter/mouseleave)
 */
export const createHoverScaleConfig = (targets: any): AnimeConfig => ({
  targets,
  scale: 1.05,
  duration: 200,
  easing: EASING.easeOut,
});

/**
 * Hover lift animation
 */
export const createHoverLiftConfig = (targets: any): AnimeConfig => ({
  targets,
  translateY: -5,
  duration: 200,
  easing: EASING.easeOut,
});

/**
 * Loading animation configs
 */
export const createLoadingConfig = {
  pulse: (targets: any): AnimeConfig => ({
    targets,
    scale: [1, 1.05, 1],
    duration: 1000,
    loop: true,
    easing: EASING.easeInOut,
  }),
  spin: (targets: any): AnimeConfig => ({
    targets,
    rotate: 360,
    duration: 1000,
    loop: true,
    easing: EASING.linear,
  }),
  bounce: (targets: any): AnimeConfig => ({
    targets,
    translateY: [0, -10, 0],
    duration: 600,
    loop: true,
    easing: EASING.easeInOut,
  }),
};

// Re-export anime for convenience
import anime from 'animejs';
export { anime };
