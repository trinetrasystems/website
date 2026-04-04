import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Brain, Zap, ShieldCheck } from "lucide-react";

const features = [
  { icon: Eye, title: "Comprehensive Visibility", desc: "Unified, real-time visibility across all camera feeds and monitored zones." },
  { icon: Brain, title: "Intelligent Analysis", desc: "Deep learning models that understand context, behavior, and intent." },
  { icon: Zap, title: "Instant Alerts", desc: "Sub-second detection and notification for critical security events." },
  { icon: ShieldCheck, title: "Operational Security", desc: "End-to-end surveillance automation for safer and more reliable operations." },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI-Powered <span className="text-gradient">Intelligence</span> for Modern Surveillance
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Trinetra delivers real-time situational awareness for surveillance environments. Our AI platform detects events, identifies risk patterns, and supports faster, more accurate operational decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-6 text-center glow-hover transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
