import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Shield, Target, Plug, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import lightBg from "../../videosandphotoes/light.PNG";
import darkBg from "../../videosandphotoes/dark.PNG";
import { EASE_OUT_SOFT } from "@/lib/motion";
import { scrollToSection } from "@/lib/smoothScroll";

// Hero content rises in one piece after another: badge, headline, bar, copy, bullets, button.
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_SOFT } },
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        <img src={lightBg} alt="AI surveillance and camera detection system dashboard" className="absolute inset-0 w-full h-full object-cover object-center dark:hidden" />
        <img src={darkBg} alt="AI-powered smart CCTV analytics platform" className="absolute inset-0 w-full h-full object-cover object-center hidden dark:block" />
        {/* Stronger overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 dark:from-black/80 dark:via-black/60 dark:to-black/80" />
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
        <div aria-hidden className="ambient-glow absolute left-1/2 top-0 h-[75%] w-[95%] mix-blend-screen" />
      </div>

      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-scan-line" />
      </div>

      {/* Top padding clears the floating header, which sits over the hero image. */}
      <div className="relative z-10 max-w-5xl px-4 md:px-6 pt-28 pb-20 md:pt-36 md:pb-32 md:pl-10 lg:pl-16 text-left">
        <motion.div initial="hidden" animate="show" variants={heroContainer}>
          <motion.div variants={heroItem} className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-8 text-sm font-semibold tracking-wide text-white shadow-xl">
            <span className="relative flex w-3 h-3">
              <span aria-hidden className="ping-ring absolute inset-0 rounded-full bg-red-500" />
              <span className="relative w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/25 shadow-[0_0_14px_rgba(239,68,68,0.85)] animate-pulse-glow" />
            </span>
            AI Live Detection
          </motion.div>

          <motion.h1 variants={heroItem} className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">AI-Powered Surveillance&nbsp;&</span>
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-[#ffb300] dark:to-[#ff6f00] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Camera Detection Solutions</span>
          </motion.h1>

          <motion.span variants={heroItem} aria-hidden className="block h-0.5 w-12 mb-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" />

          <motion.p variants={heroItem} className="max-w-3xl mb-10 text-2xl md:text-3xl font-bold text-white drop-shadow-lg leading-tight">
            Turn your existing CCTV into a smart AI surveillance system with real-time detection, <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-[#ffb300] dark:to-[#ff6f00] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] italic">instant alerts</span>, and complete data privacy.
          </motion.p>

          <motion.ul variants={heroItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-white font-bold">
            {[
              { icon: Zap, text: "Real-time alerts" },
              { icon: Shield, text: "100% data privacy (no cloud)" },
              { icon: Target, text: "Custom AI detections" },
              { icon: Plug, text: "Works with existing CCTV" },
              { icon: Rocket, text: "Setup in 3–5 days" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-base md:text-lg drop-shadow-md group">
                <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                  <item.icon className="w-4 h-4 text-amber-500" />
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={heroItem} className="flex flex-wrap gap-4 justify-start">
            <motion.a
              href="#contact"
              onClick={(e) => {
                if (scrollToSection("contact")) e.preventDefault();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-shine px-10 py-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-black text-xl shadow-2xl hover:shadow-primary/40 transition-all flex items-center gap-3"
            >
              Book Free Demo
              <ArrowRight className="w-6 h-6" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue leading into the pinned "How it works" story. */}
      <button
        type="button"
        onClick={() => scrollToSection("engine", 0)}
        aria-label="Scroll to how Trinetra works"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] transition-colors hover:text-white md:flex"
      >
        <span className="scroll-cue__mouse">
          <span className="scroll-cue__wheel" />
        </span>
        <span className="scroll-cue__label text-[11px] font-semibold uppercase tracking-[0.3em]">Scroll to explore</span>
        <span className="scroll-cue__line" />
      </button>
    </section>
  );
};

export default Hero;
