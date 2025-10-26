import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BounceProps {
  children: ReactNode;
  delay?: number;
  scale?: number;
  className?: string;
}

export const Bounce = ({ children, delay = 0, scale = 1.05, className }: BounceProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
