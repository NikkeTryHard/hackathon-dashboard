// Shared animation configurations to reduce object creation overhead
// These are defined once and reused across components

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
} as const;

export const fadeInUpSmall = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
} as const;

export const fadeInDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
} as const;

// Stagger delays for card grids (use with index-based iteration)
export const staggerDelay = (index: number, baseDelay = 0.05) => ({
  delay: index * baseDelay,
  duration: 0.4,
  ease: [0.23, 1, 0.32, 1] as const,
});

// Simple delayed transition for components that receive delay as a prop
export const delayedTransition = (delay: number) => ({
  delay,
  duration: 0.4,
  ease: [0.23, 1, 0.32, 1] as const,
});
