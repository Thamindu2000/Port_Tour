import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  className = '',
  threshold = 0.1
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  const getVariants = () => {
    const directions = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance }
    };

    return {
      hidden: {
        opacity: 0,
        ...directions[direction]
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut'
        }
      }
    };
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredScrollReveal = ({
  children,
  staggerDelay = 0.1,
  className = '',
  childClassName = ''
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants} className={childClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export const ParallaxSection = ({
  children,
  speed = 0.5,
  className = '',
  style = {}
}) => {
  const ref = useRef(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const offset = rect.top + scrollTop;
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
          setOffsetY((scrollTop - offset) * speed);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offsetY}px)`, ...style }}>
      {children}
    </div>
  );
};

export const CounterAnimation = ({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  className = ''
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.5 });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (isInView && to !== undefined) {
      let startTime = null;
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

        setCount(Math.floor(from + (to - from) * progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(to);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const TypingAnimation = ({
  text,
  speed = 50,
  className = '',
  cursor = true,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-primary"
        >
          |
        </motion.span>
      )}
    </span>
  );
};

const scrollAnimationExports = {
  ScrollReveal,
  StaggeredScrollReveal,
  ParallaxSection,
  CounterAnimation,
  TypingAnimation
};

export default scrollAnimationExports;
