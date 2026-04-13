import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Calendar } from "lucide-react";

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        className="max-w-6xl mx-auto glass rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden border-primary/20 bg-primary/5 shadow-2xl"
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            We value your <span className="text-gradient">safety and time</span>.
          </h2>
          <p className="text-muted-foreground text-xl md:text-2xl font-semibold mb-10 max-w-2xl mx-auto">
            Call the founder now for a quick demo and consultation.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <motion.a
              href="tel:+919924315066"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-primary transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </motion.a>
            <motion.a
              href="#contact-form"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl glass-strong border-white/20 font-bold text-lg hover:bg-white/10 transition-all text-foreground dark:text-white drop-shadow-md"
            >
              <Calendar className="w-5 h-5" />
              Book Free Demo
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
