import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Cctv } from "lucide-react";
import { jumpTo } from "@/lib/smoothScroll";

// Pinned scroll story: "Your CCTV" and "Trinetra AI" pieces fly in from the sides,
// lock together with a pulse and shockwave, then light rays stream out behind them.
// The stage stays dark in both themes, continuing the hero.

// Puzzle outlines (300×200 units). The left piece has a notch on its right edge,
// the right piece a matching tab on its left edge (viewBox starts at x = -30).
const LEFT_PIECE = "M24 0H276A24 24 0 0 1 300 24V70A30 30 0 0 0 300 130V176A24 24 0 0 1 276 200H24A24 24 0 0 1 0 176V24A24 24 0 0 1 24 0Z";
const RIGHT_PIECE = "M24 0H276A24 24 0 0 1 300 24V176A24 24 0 0 1 276 200H24A24 24 0 0 1 0 176V128A28 28 0 0 1 0 72V24A24 24 0 0 1 24 0Z";

const CYAN = "hsl(185 80% 55%)";
const VIOLET = "hsl(250 85% 68%)";

// Deterministic "random" values so every render draws the same rays.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const between = (i: number, salt: number, min: number, max: number) => min + rand(i, salt) * (max - min);

const RAYS = Array.from({ length: 20 }, (_, i) => ({
  "--a": `${between(i, 1, -24, 24).toFixed(1)}deg`,
  "--len": `${between(i, 2, 14, 34).toFixed(1)}vw`,
  "--h": `${Math.round(between(i, 3, 1, 3.4))}px`,
  "--x0": `${between(i, 4, 16, 26).toFixed(1)}vw`,
  "--x1": `${between(i, 5, 50, 74).toFixed(1)}vw`,
  "--dur": `${between(i, 6, 1.7, 4.1).toFixed(2)}s`,
  "--delay": `${(-between(i, 7, 0, 4)).toFixed(2)}s`,
  "--o": between(i, 8, 0.3, 0.95).toFixed(2),
})) as CSSProperties[];

const Rays = ({ color, mirrored }: { color: string; mirrored?: boolean }) => (
  <div className={`absolute inset-0 ${mirrored ? "-scale-x-100" : ""}`} style={{ "--ray-color": color } as CSSProperties}>
    {RAYS.map((style, i) => (
      <span key={i} className="engine-ray" style={style} />
    ))}
  </div>
);

const EngineStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(sectionRef);
  const [raysRunning, setRaysRunning] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // The sequence only plays forward: scrolling back up holds the finished state
  // instead of rewinding. On the first upward scroll the section also collapses to a
  // single screen, so scrolling back up isn't stuck in the story's scroll distance.
  const progress = useMotionValue(0);
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (collapsedRef.current) return;

    if (value > progress.get()) {
      progress.set(value);
      return;
    }

    // Scrolled up (past a small threshold, so trackpad jitter doesn't trigger it):
    // drop the remaining scroll distance and hold the scroll where it already is,
    // which keeps the stage looking identical while the section shrinks.
    const previous = scrollYProgress.getPrevious() ?? value;
    const section = sectionRef.current;
    if (!section || value > previous - 0.01) return;

    collapsedRef.current = true;
    setCollapsed(true);
    jumpTo(section.getBoundingClientRect().top + window.scrollY);
  });

  // Re-arm once the section has left upwards (it sits below the viewport again), so the
  // next pass downwards plays in full. Leaving downwards keeps the finished state, so
  // coming back up to it shows the final frame.
  useEffect(() => {
    if (inView) return;
    const section = sectionRef.current;
    if (!section || section.getBoundingClientRect().top <= 0) return;

    collapsedRef.current = false;
    setCollapsed(false);
    progress.set(0);
  }, [inView, progress]);

  const stageGlow = useTransform(progress, [0, 0.3], [0.25, 1]);
  const leftX = useTransform(progress, [0, 0.45], ["-115%", "0%"]);
  const rightX = useTransform(progress, [0, 0.45], ["115%", "0%"]);
  const leftRotate = useTransform(progress, [0, 0.45], [-8, 0]);
  const rightRotate = useTransform(progress, [0, 0.45], [8, 0]);
  const pieceGlow = useTransform(progress, [0.1, 0.45], [0, 0.9]);
  const lockPulse = useTransform(progress, [0.45, 0.5, 0.58], [1, 1.05, 1]);
  const ringScale = useTransform(progress, [0.46, 0.78], [0.2, 2.9]);
  const ringOpacity = useTransform(progress, [0.46, 0.52, 0.78], [0, 0.9, 0]);
  const ring2Scale = useTransform(progress, [0.5, 0.8], [0.2, 2.2]);
  const ring2Opacity = useTransform(progress, [0.5, 0.56, 0.8], [0, 0.75, 0]);
  const raysOpacity = useTransform(progress, [0.55, 0.72], [0, 1]);
  const textOpacity = useTransform(progress, [0.62, 0.78], [0, 1]);
  const textY = useTransform(progress, [0.62, 0.78], [24, 0]);

  // Only run the ray animations while they are actually visible.
  useMotionValueEvent(progress, "change", (value) => setRaysRunning(value > 0.55));

  const animated = !reduceMotion;

  return (
    <section
      ref={sectionRef}
      id="engine"
      aria-label="How Trinetra works"
      className={`relative bg-[#05070f] text-white ${animated ? (collapsed ? "h-[100svh]" : "h-[250vh]") : ""}`}
    >
      {/* Stage: pieces, rings, rays and glow all share one anchor point (--cy, see index.css). */}
      <div className={`engine-stage ${animated ? "sticky top-0" : "relative"} h-[100svh] overflow-hidden`}>
        <motion.div aria-hidden style={{ opacity: animated ? stageGlow : 1 }} className="engine-glow pointer-events-none absolute inset-0" />

        {animated && (
          <>
            <motion.div
              aria-hidden
              data-running={raysRunning && inView}
              style={{ opacity: raysOpacity }}
              className="engine-rays pointer-events-none absolute inset-0"
            >
              <Rays color={VIOLET} />
              <Rays color={CYAN} mirrored />
            </motion.div>
            <motion.div aria-hidden style={{ scale: ringScale, opacity: ringOpacity }} className="engine-ring" />
            <motion.div aria-hidden style={{ scale: ring2Scale, opacity: ring2Opacity }} className="engine-ring engine-ring--violet" />
          </>
        )}

        <div className="engine-anchor absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div style={animated ? { scale: lockPulse } : undefined} className="relative flex items-center">
            <motion.div style={animated ? { x: leftX, rotate: leftRotate } : undefined} className="relative">
              <motion.div aria-hidden style={{ opacity: animated ? pieceGlow : 0.9 }} className="engine-piece-glow engine-piece-glow--cyan" />
              <div className="relative" style={{ width: "var(--piece)" }}>
                <svg viewBox="0 0 300 200" className="block w-full h-auto" aria-hidden>
                  <defs>
                    <linearGradient id="engine-left-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#161b2e" />
                      <stop offset="1" stopColor="#0a0d18" />
                    </linearGradient>
                    <linearGradient id="engine-left-stroke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor={CYAN} />
                      <stop offset="1" stopColor={VIOLET} />
                    </linearGradient>
                  </defs>
                  <path d={LEFT_PIECE} fill="url(#engine-left-fill)" stroke="url(#engine-left-stroke)" strokeWidth="1.5" />
                </svg>
                <div className="absolute inset-0 pr-[10%] flex flex-col items-center justify-center gap-1.5 md:gap-2 text-center">
                  <span className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[hsl(185_80%_50%/0.12)]">
                    <Cctv className="h-4 w-4 md:h-6 md:w-6" style={{ color: CYAN }} />
                  </span>
                  <span className="font-['Outfit'] text-base md:text-2xl font-bold leading-tight">Your CCTV</span>
                  <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.1em] md:tracking-[0.2em]" style={{ color: CYAN }}>
                    Existing cameras
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={animated ? { x: rightX, rotate: rightRotate } : undefined}
              className="relative"
            >
              <motion.div aria-hidden style={{ opacity: animated ? pieceGlow : 0.9 }} className="engine-piece-glow engine-piece-glow--violet" />
              <div className="relative" style={{ width: "calc(var(--piece) * 1.1)", marginLeft: "calc(var(--piece) * -0.1)" }}>
                <svg viewBox="-30 0 330 200" className="block w-full h-auto" aria-hidden>
                  <defs>
                    <linearGradient id="engine-right-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#161b2e" />
                      <stop offset="1" stopColor="#0a0d18" />
                    </linearGradient>
                    <linearGradient id="engine-right-stroke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor={VIOLET} />
                      <stop offset="1" stopColor={CYAN} />
                    </linearGradient>
                  </defs>
                  <path d={RIGHT_PIECE} fill="url(#engine-right-fill)" stroke="url(#engine-right-stroke)" strokeWidth="1.5" />
                </svg>
                <div className="absolute inset-0 pl-[9%] flex flex-col items-center justify-center gap-1.5 md:gap-2 text-center">
                  <img src="/logo/mark-512.png" alt="" className="h-8 w-8 md:h-12 md:w-12 rounded-xl" />
                  <span className="font-['Outfit'] text-base md:text-2xl font-bold leading-tight">Trinetra AI</span>
                  <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.1em] md:tracking-[0.2em]" style={{ color: VIOLET }}>
                    Real-time detection
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          style={animated ? { opacity: textOpacity, y: textY } : undefined}
          className="engine-copy absolute inset-x-0 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: CYAN }}>How it works</p>
          <h2 className="text-3xl md:text-5xl font-bold">
            Your cameras. Our AI.
            <br />
            <span className="bg-gradient-to-r from-[hsl(250_85%_68%)] to-[hsl(185_80%_55%)] bg-clip-text text-transparent">
              One security engine.
            </span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/70">
            Trinetra plugs into the CCTV you already own and turns every feed into real-time detection and instant alerts — on
            your premises, with no cloud.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EngineStory;
