import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bell, Brain, BarChart3, Cloud, Network } from "lucide-react";

const features = [
  { icon: Bell, title: "Real-time Alerts", desc: "Instant push notifications for detected events across all camera feeds." },
  { icon: Brain, title: "AI-Powered Detection", desc: "State-of-the-art YOLO models for accurate object and behavior detection." },
  { icon: BarChart3, title: "Heatmaps & Analytics", desc: "Visual analytics dashboards with movement heatmaps and trend analysis." },
  { icon: Cloud, title: "Cloud + Edge Deployment", desc: "Flexible deployment on cloud infrastructure or edge devices for low latency." },
  { icon: Network, title: "Scalable Architecture", desc: "Handle thousands of camera feeds with distributed processing architecture." },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for scale, speed, and accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-6 glow-hover transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
