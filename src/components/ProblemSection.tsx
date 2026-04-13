import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { EyeOff, AlertTriangle, BellOff, ShieldAlert, CloudOff } from "lucide-react";

const problems = [
  { icon: EyeOff, title: "Manual monitoring is unreliable", desc: "Human operators miss critical events due to fatigue and distractions." },
  { icon: AlertTriangle, title: "Critical events are missed", desc: "Important incidents go unnoticed until it's too late to respond." },
  { icon: BellOff, title: "No real-time alerts", desc: "Traditional CCTV records footage but never warns you proactively." },
  { icon: ShieldAlert, title: "High risk of accidents and losses", desc: "Without automated detection, workplace safety incidents increase." },
  { icon: CloudOff, title: "Data privacy concerns with cloud systems", desc: "Uploading sensitive footage to the cloud exposes your data to breaches." },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="py-16 md:py-28 px-4 md:px-6 relative overflow-hidden" ref={ref}>
      {/* Subtle red-tinted background gradient to evoke urgency */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 via-transparent to-orange-950/10 dark:from-red-950/20 dark:via-transparent dark:to-orange-950/15 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-semibold mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Problem
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Traditional <span className="text-red-500 dark:text-red-400">CCTV Fails</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most CCTV systems are passive — they record, but they don't protect. Here's what goes wrong.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 group hover:border-red-500/30 transition-all duration-500 relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <p.icon className="w-7 h-7 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
