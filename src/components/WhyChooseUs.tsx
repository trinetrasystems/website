import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle } from "lucide-react";

const reasons = [
  { title: "Fully customizable AI", desc: "Not fixed features, we build what you need" },
  { title: "Near real-time alerts", desc: "No delayed cloud alerts, instant notifications" },
  { title: "On-device processing", desc: "Complete privacy, data never leaves your premises" },
  { title: "Faster deployment than enterprise solutions", desc: "Ready in days, not months" },
  { title: "Cost-effective and scalable", desc: "Affordable solutions that grow with your business" },
];

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-choose-us" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why <span className="text-gradient">Trinetra Systems</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 glass p-6 rounded-2xl hover:bg-secondary/30 transition-colors border-white/5"
            >
              <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-1">{r.title}</h3>
                <p className="text-muted-foreground">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
