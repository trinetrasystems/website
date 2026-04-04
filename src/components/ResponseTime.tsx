import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Cpu, Timer, Gauge } from "lucide-react";

const stats = [
  { icon: Timer, value: "<50ms", label: "Response Time", desc: "Ultra-low latency detection on edge devices" },
  { icon: Cpu, value: "On-Device", label: "Edge Deployment", desc: "Run AI models directly on cameras and edge hardware" },
  { icon: Zap, value: "Real-time", label: "Live Detection", desc: "30+ FPS processing for instant event detection" },
  { icon: Gauge, value: "99.9%", label: "Uptime SLA", desc: "Enterprise-grade reliability and availability" },
];

const ResponseTime = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Built for <span className="text-gradient">Speed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            On-device deployment with sub-50ms response time for real-time detection that never misses a moment.
          </p>
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
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-7 h-7 text-accent" />
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
