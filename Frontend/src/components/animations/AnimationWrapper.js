import React from 'react';
import { motion } from 'framer-motion';

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const slideInFromBottom = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' }
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// Loading skeleton animation
export const pulseAnimation = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const hoverLift = {
  y: -5,
  transition: { duration: 0.2 }
};

// Animation wrapper components
export const FadeInUp = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FadeInLeft = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FadeInRight = ({ children, delay = 0, duration = 0.6, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, duration = 0.5, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className = '' }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInFromBottom = ({ children, delay = 0, duration = 0.8, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Loading skeleton component
export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    style={{ width, height }}
    variants={pulseAnimation}
    animate="animate"
  />
);

// Enhanced button with hover effects that supports React Router Link
export const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  as: Component = 'button',
  to,
  ...props
}) => {
  const motionProps = {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  };

  if (Component === 'button') {
    return (
      <motion.button
        className={`btn btn-${variant} ${className}`}
        onClick={onClick}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  // For React Router Link or other components
  return (
    <motion.div {...motionProps}>
      <Component
        className={`btn btn-${variant} ${className}`}
        onClick={onClick}
        to={to}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
};

// Card with hover effects
export const AnimatedCard = ({ children, className = '', onClick, ...props }) => (
  <motion.div
    className={`card ${className}`}
    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    {...props}
  >
    {children}
  </motion.div>
);

const animationExports = {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  slideInFromBottom,
  pageTransition,
  pulseAnimation,
  hoverScale,
  hoverLift,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  ScaleIn,
  StaggerContainer,
  SlideInFromBottom,
  SkeletonLoader,
  AnimatedButton,
  AnimatedCard
};

export default animationExports;
