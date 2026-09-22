// Shared scroll-in motion so every section enters the same way:
// a short rise with a long, soft ease-out.
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

export const fadeUp = (inView: boolean, delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: inView ? { opacity: 1, y: 0 } : {},
  transition: { duration: 0.8, ease: EASE_OUT_SOFT, delay },
});

/** Stagger for items in a grid or list: `fadeUp(inView, stagger(i))`. */
export const stagger = (index: number, base = 0.1) => base + index * 0.08;
