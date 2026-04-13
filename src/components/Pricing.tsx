import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const pricingPoints = [
  "Affordable setup cost",
  "Monthly subscription per camera",
  "Maintenance and updates included",
];

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-16 md:py-28 px-4 md:px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple & <span className="text-gradient">Flexible Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hidden charges. No complex licenses. Just straightforward pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
        >
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl" />

          <div className="flex items-center gap-3 mb-8 justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Transparent Pricing</span>
          </div>

          <div className="space-y-5 mb-10">
            {pricingPoints.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-lg font-medium">{point}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg glow-primary transition-all shadow-xl"
            >
              Get Custom Quote
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
