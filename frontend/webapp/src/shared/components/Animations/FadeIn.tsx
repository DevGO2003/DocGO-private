import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const FadeIn = ({ children, delay = 0, duration = 0.3, className }: FadeInProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
