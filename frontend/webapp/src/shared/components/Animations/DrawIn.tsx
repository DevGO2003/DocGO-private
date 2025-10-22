import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DrawInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * DrawIn animation - Simulates hand-drawn reveal effect
 * Creates a drawing animation by animating stroke-dashoffset
 */
export const DrawIn = ({ children, delay = 0, duration = 1, className }: DrawInProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        pathLength: 0,
      }}
      animate={{
        opacity: 1,
        pathLength: 1,
      }}
      transition={{
        delay,
        duration,
        ease: 'easeInOut',
        pathLength: {
          type: 'spring',
          duration: duration * 1.5,
          bounce: 0,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
