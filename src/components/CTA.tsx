import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 md:p-16 glow-primary relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Secure Your Business with <span className="text-gradient">Trinetra Systems</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join leading enterprises who trust Trinetra Systems' AI-powered surveillance to protect what matters most.
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg glow-primary transition-all"
          >
            Request Demo
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
