import { useAnimation as useFramerAnimation, AnimationControls } from 'framer-motion';
import { useEffect } from 'react';

interface UseAnimationOptions {
  triggerOnMount?: boolean;
  delay?: number;
}

/**
 * Custom hook for controlling animations
 * Wraps framer-motion's useAnimation with additional features
 */
export const useAnimation = (options: UseAnimationOptions = {}): AnimationControls => {
  const { triggerOnMount = true, delay = 0 } = options;
  const controls = useFramerAnimation();

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => {
        controls.start('visible');
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, delay, controls]);

  return controls;
};

/**
 * Predefined animation variants
 */
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  },
};

/**
 * Stagger animation for lists
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};
