import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, ShoppingCart, Factory, HardHat, CheckCircle2 } from "lucide-react";
import solutionImg from "@/assets/ai-monitoring.png";

const solutions = [
  "Automatically monitors all cameras",
  "Sends Real-Time Alerts",
  "Runs completely on your premises",
  "Reduces risks, accidents, and manual effort",
];

const Solutions = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solutions" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI Monitoring That <span className="text-gradient">Works For You</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="glass rounded-[2.5rem] p-8 md:p-16 border-white/5 bg-secondary/5 overflow-hidden shadow-2xl mx-auto max-w-3xl"
        >
          <div className="space-y-8">
            {solutions.map((s, i) => (
              <div key={i} className="flex gap-6 group items-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{s}</h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;
