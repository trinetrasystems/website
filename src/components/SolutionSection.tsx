import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MonitorCheck, BellRing, Server, TrendingDown, CheckCircle2 } from "lucide-react";

const solutions = [
  { icon: MonitorCheck, text: "Automatically monitors all cameras" },
  { icon: BellRing, text: "Sends near real-time alerts" },
  { icon: Server, text: "Runs completely on your premises" },
  { icon: TrendingDown, text: "Reduces risks, accidents, and manual effort" },
];

const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solution" className="py-16 md:py-28 px-4 md:px-6 bg-gradient-dark relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6">
            <CheckCircle2 className="w-4 h-4" />
            The Solution
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI Monitoring That <span className="text-gradient">Works For You</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trinetra transforms your existing CCTV into an intelligent safety system that watches, detects, and alerts — automatically.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((s, i) => (
            <motion.div
              key={s.text}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass rounded-2xl p-8 flex items-start gap-5 group hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{s.text}</h3>
                <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary to-accent opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
