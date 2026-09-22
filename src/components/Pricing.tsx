import { motion, useInView } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import SectionHeader from "./SectionHeader";
import { scrollToSection } from "@/lib/smoothScroll";
import { useRef } from "react";

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          eyebrow="Pricing"
          inView={isInView}
          title={<>Simple & <span className="text-gradient">Flexible Pricing</span></>}
        />

        <motion.div
          {...fadeUp(isInView, 0.2)}
          className="glass rounded-3xl p-8 md:p-12 border-primary/20 bg-primary/5 shadow-glow-primary relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Affordable One-Time Setup</h3>
                <p className="text-muted-foreground">Start with a low upfront investment. No heavy infrastructure costs.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Flexible Maintenance Plans</h3>
                <p className="text-muted-foreground">Choose monthly or yearly support plans based on your needs.</p>
              </div>
            </div>
            <div className="text-center">
              <motion.a
                href="#contact"
                onClick={(e) => {
                  if (scrollToSection("contact")) e.preventDefault();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-shine inline-block px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg hover:shadow-primary/30 transition-all font-outfit"
              >
                Get Custom Quote
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
