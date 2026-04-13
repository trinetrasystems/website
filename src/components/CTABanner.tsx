import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, ArrowRight, Heart, Clock } from "lucide-react";

const CTABanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 md:py-24 px-4 md:px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center glass rounded-3xl p-10 md:p-16 glow-primary relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">We Care About Your Safety</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            We value your <span className="text-gradient">safety</span> and <span className="text-gradient">time</span>.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Call the founder now for a quick demo and consultation. No sales pitch — just honest advice on how AI can secure your facility.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <motion.a
              href="tel:+919924315066"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg glow-primary transition-all shadow-xl"
            >
              Book Free Demo
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Response within 2 hours</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTABanner;
