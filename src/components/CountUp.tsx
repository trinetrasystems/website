import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT_SOFT } from "@/lib/motion";

// Counts every number of 10 or more inside `value` (e.g. "95%+", "100%") up from
// zero when it scrolls into view. Small numbers ("<1", "3-5") stay as they are.
const CountUp = ({ value, duration = 1.6 }: { value: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setProgress(1);
      return;
    }
    const controls = animate(0, 1, { duration, ease: EASE_OUT_SOFT, onUpdate: setProgress });
    return () => controls.stop();
  }, [inView, reduceMotion, duration]);

  const text = value.replace(/\d+/g, (n) => (Number(n) >= 10 ? String(Math.round(Number(n) * progress)) : n));

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden>{text}</span>
    </span>
  );
};

export default CountUp;
