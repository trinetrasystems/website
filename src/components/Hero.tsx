import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover object-center opacity-55 dark:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/35 via-background/20 to-background/35 dark:from-background/80 dark:via-background/45 dark:to-background/60" />
        <div className="absolute inset-0 bg-grid opacity-18 dark:opacity-12" />
      </div>

      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-scan-line" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-accent">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-glow" />
            AI-Powered Computer Vision Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-gradient">Trinetra</span>
            <br />
            <span className="text-foreground">AI-Powered Smart</span>
            <br />
            <span className="text-foreground">Surveillance</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            See Everything. Detect Anything. Act Instantly.
            <br />
            Real-time video analytics powered by advanced YOLO models for security, safety, and automation.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary transition-all"
            >
              Request Demo
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#solutions"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg glass text-foreground font-semibold glow-hover transition-all"
            >
              <Play className="w-5 h-5" />
              Explore Solutions
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
