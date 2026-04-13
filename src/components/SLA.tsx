import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const slaData = [
  { severity: "Critical", description: "System down, no alerts", response: "1 hour", resolution: "4 hours", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { severity: "High", description: "Major detection not working", response: "4 hours", resolution: "24 hours", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { severity: "Medium", description: "Minor detection issue", response: "24 hours", resolution: "72 hours", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { severity: "Low", description: "Feature request, optimization", response: "72 hours", resolution: "Next release", color: "bg-green-500/20 text-green-400 border-green-500/30" },
];

const SLA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sla" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">SLA</span> & Support
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Guaranteed response times for every severity level. Your security never waits.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden shadow-2xl border-white/5"
        >
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-5 border-b border-border/50 text-[10px] md:text-sm font-bold text-muted-foreground bg-secondary/20">
            <span>Severity</span>
            <span>Description</span>
            <span className="text-center">Response</span>
            <span className="text-center">Resolution</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {slaData.map((row, i) => (
              <motion.div
                key={row.severity}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-6 hover:bg-secondary/30 transition-colors items-center"
              >
                <div>
                  <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${row.color}`}>
                    {row.severity}
                  </span>
                </div>
                <span className="text-[10px] md:text-sm font-medium text-foreground">{row.description}</span>
                <span className="text-[10px] md:text-sm font-bold text-center">{row.response}</span>
                <span className="text-[10px] md:text-sm font-bold text-center">{row.resolution}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SLA;
