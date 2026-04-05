import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import videoFile from "@/assets/video.MP4";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source src={videoFile} type="video/mp4" />
        </video>
        {/* Light Blur and Overlay */}
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/10 to-black/15 dark:from-black/30 dark:via-black/20 dark:to-black/30" />
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
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-strong mb-8 text-sm font-semibold tracking-wide text-foreground shadow-sm">
            <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/25 shadow-[0_0_14px_rgba(239,68,68,0.85)] animate-pulse-glow" />
            AI-Powered Computer Vision Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            <span className="text-gradient drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">Trinetra Systems</span>
            <br />
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">AI-Powered Smart</span>
            <br />
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Surveillance</span>
          </h1>

          <p className="max-w-2xl mb-10 leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            <span className="block text-xl md:text-2xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
              AI Where You Need It.
            </span>
            <span className="block mt-2 text-base md:text-lg text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Real-time video intelligence for security, safety, and automation with fast and reliable
              <span className="font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"> edge device deployment</span>.
            </span>
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
