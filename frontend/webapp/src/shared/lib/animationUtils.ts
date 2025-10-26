/**
 * Animation Utility Functions
 * Helper functions for animations (Framer Motion + Anime.js ready)
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Create stagger animation for lists
 */
export const createStagger = (
  staggerDelay: number = 0.1,
  delayChildren: number = 0
): Transition => {
  return {
    staggerChildren: staggerDelay,
    delayChildren,
  };
};

/**
 * Create spring animation config
 */
export const createSpring = (
  stiffness: number = 300,
  damping: number = 24
): Transition => {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
};

/**
 * Create tween animation config
 */
export const createTween = (
  duration: number = 0.3,
  ease: string | number[] = 'easeInOut'
): Transition => {
  return {
    type: 'tween',
    duration,
    ease,
  };
};

/**
 * Fade variants factory
 */
export const createFadeVariants = (
  delay: number = 0,
  duration: number = 0.3
): Variants => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        duration,
      },
    },
  };
};

/**
 * Slide variants factory
 */
export const createSlideVariants = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance: number = 20,
  delay: number = 0,
  duration: number = 0.4
): Variants => {
  const offset = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
  };

  return {
    hidden: {
      opacity: 0,
      ...offset[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

/**
 * Scale variants factory
 */
export const createScaleVariants = (
  initialScale: number = 0.8,
  delay: number = 0,
  duration: number = 0.3
): Variants => {
  return {
    hidden: {
      opacity: 0,
      scale: initialScale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay,
        duration,
      },
    },
  };
};

/**
 * Rotate variants factory
 */
export const createRotateVariants = (
  initialRotate: number = -180,
  delay: number = 0,
  duration: number = 0.5
): Variants => {
  return {
    hidden: {
      opacity: 0,
      rotate: initialRotate,
    },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: {
        delay,
        duration,
      },
    },
  };
};

/**
 * Create hover effect
 */
export const createHoverEffect = (
  scale: number = 1.05,
  y: number = 0
) => {
  return {
    whileHover: {
      scale,
      y,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    whileTap: {
      scale: 0.95,
    },
  };
};

/**
 * Create tap effect
 */
export const createTapEffect = (scale: number = 0.95) => {
  return {
    whileTap: {
      scale,
      transition: {
        duration: 0.1,
      },
    },
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
 * Easing functions
 */
export const easings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  anticipate: [0.36, 0.66, 0.04, 1],
} as const;

/**
 * Duration presets (in seconds)
 */
export const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1,
} as const;
