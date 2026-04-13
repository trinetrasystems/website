import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Target, Timer, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Zap, value: "<1 second", label: "Alert Time", desc: "Immediate notification for critical events" },
  { icon: Target, value: "95%+", label: "Detection Accuracy", desc: "Reliable AI models trained for accuracy" },
  { icon: Timer, value: "3-5 days", label: "Deployment", desc: "Fast and seamless setup on existing systems" },
  { icon: ShieldCheck, value: "100%", label: "On-Premise", desc: "Complete data privacy and security" },
];

const ResponseTime = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-8 text-center glow-hover transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-1">{s.value}</div>
              <div className="text-sm font-semibold mb-2">{s.label}</div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResponseTime;
