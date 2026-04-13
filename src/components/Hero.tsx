import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Crosshair, Plug, Rocket, ChevronDown } from "lucide-react";
import lightBg from "../../videosandphotoes/light.PNG";
import darkBg from "../../videosandphotoes/dark.PNG";

const highlights = [
  { icon: Zap, text: "Near real-time alerts (minimal delay)" },
  { icon: Shield, text: "100% data privacy (no cloud)" },
  { icon: Crosshair, text: "Custom AI detections" },
  { icon: Plug, text: "Works with existing CCTV" },
  { icon: Rocket, text: "Setup in 3–5 days" },
];

const quickNav = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#usecases" },
  { label: "Industries", href: "#factory-usecases" },
  { label: "Why Us", href: "#why-trinetra" },
  { label: "Pricing", href: "#pricing" },
  { label: "Proof", href: "#proof" },
  { label: "Contact", href: "#contact" },
];

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

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Turn Your Existing CCTV Into a</span>
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-[#ffb300] dark:to-[#ff6f00] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Real-Time AI Safety System</span>
          </h1>

          <p className="max-w-2xl mb-8 leading-relaxed text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            <span className="block text-lg md:text-xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
              Near real-time alerts, 100% on-premise processing, and fully customizable detection — deployed in days, not months.
            </span>
          </p>

          {/* 5 Bullet Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-10 max-w-xl"
          >
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                  <h.icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">{h.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <div className="flex flex-wrap gap-4 justify-start mb-12">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-premium bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl hover:shadow-primary/30"
            >
              Book Free Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ChevronDown className="w-4 h-4 text-white/60 animate-bounce" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Explore</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickNav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
