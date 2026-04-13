import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import lightBg from "../../videosandphotoes/light.PNG";
import darkBg from "../../videosandphotoes/dark.PNG";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        <img src={lightBg} alt="" className="absolute inset-0 w-full h-full object-cover object-center dark:hidden" />
        <img src={darkBg} alt="" className="absolute inset-0 w-full h-full object-cover object-center hidden dark:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-black/25 dark:from-black/50 dark:via-black/40 dark:to-black/50" />
        <div className="absolute inset-0 bg-grid opacity-18 dark:opacity-12" />
      </div>

      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-scan-line" />
      </div>

      <div className="relative z-10 max-w-4xl px-4 md:px-6 py-20 md:py-32 md:pl-10 lg:pl-16 text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-8 text-sm font-semibold tracking-wide text-white shadow-xl">
            <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/25 shadow-[0_0_14px_rgba(239,68,68,0.85)] animate-pulse-glow" />
            AI Live Detection
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Turn Your Existing CCTV Into a</span>
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-[#ffb300] dark:to-[#ff6f00] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Real-Time AI Safety System</span>
          </h1>

          <p className="max-w-2xl mb-8 text-xl md:text-2xl font-semibold text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] leading-relaxed">
            Near real-time alerts, 100% on-premise processing, and fully customizable detection — deployed in days, not months.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 text-white font-semibold">
            {[
              "⚡ Near real-time alerts (minimal delay)",
              "🔒 100% data privacy (no cloud)",
              "🎯 Custom AI detections",
              "🔌 Works with existing CCTV",
              "🚀 Setup in 3–5 days"
            ].map((highlight, i) => (
              <li key={i} className="flex items-center gap-2 text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="shrink-0">{highlight.split(" ")[0]}</span>
                {highlight.split(" ").slice(1).join(" ")}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4 justify-start">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold shadow-xl hover:shadow-primary/30 transition-all"
            >
              Book Free Demo
            </motion.a>
            <motion.a
              href="tel:+919924315066"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl glass-strong border-white/10 hover:bg-white/10 font-bold transition-all flex items-center gap-2 text-foreground dark:text-white drop-shadow-md"
            >
              Talk to Founder
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
