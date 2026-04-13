import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Crosshair, Rocket, ShieldCheck } from "lucide-react";

const metrics = [
  {
    icon: Zap,
    value: "<1s",
    label: "Alert Time",
    desc: "Near-instant detection and notification",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: Crosshair,
    value: "95%+",
    label: "Detection Accuracy",
    desc: "High-precision AI models",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Rocket,
    value: "3–5 Days",
    label: "Deployment Time",
    desc: "Fast setup with existing CCTV",
    gradient: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Data On-Premise",
    desc: "Zero cloud dependency",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
];

const TrustMetrics = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" className="py-16 md:py-28 px-4 md:px-6 relative overflow-hidden" ref={ref}>
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted <span className="text-gradient">Performance</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Numbers that speak for themselves. Built for reliability you can count on.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, type: "spring", stiffness: 100 }}
              className={`glass rounded-2xl p-6 md:p-8 text-center group hover:-translate-y-2 transition-all duration-500 shadow-xl ${m.glow}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <m.icon className="w-7 h-7 text-white" />
              </div>
              <div className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent mb-1`}>
                {m.value}
              </div>
              <div className="text-sm font-bold mb-1">{m.label}</div>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustMetrics;
