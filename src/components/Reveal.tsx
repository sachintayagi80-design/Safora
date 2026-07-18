import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: 'up' | 'down' | 'left' | 'right' | 'fade';
  once?: boolean;
}

function getVariants(from: RevealProps['from'] = 'up'): Variants {
  const dist = 28;
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: dist }, down: { y: -dist }, left: { x: dist }, right: { x: -dist }, fade: {},
  };
  return {
    hidden: { opacity: 0, ...offsets[from] },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
  };
}

export default function Reveal({ children, className, delay = 0, from = 'up', once = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={getVariants(from)}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
