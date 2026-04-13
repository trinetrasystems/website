import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bell, Shield, Target, Layout, MessageSquare, Plug } from "lucide-react";

const features = [
  { icon: Bell, title: "Near Real-Time Alerts", desc: "Get instant alerts with minimal delay for immediate action" },
  { icon: Shield, title: "On-Premise Processing", desc: "Your data stays inside your facility — no cloud dependency" },
  { icon: Target, title: "Custom AI Detection", desc: "Helmet, fire, intrusion, or any custom use-case" },
  { icon: Layout, title: "Live Dashboard", desc: "Monitor all cameras with real-time insights and event tracking" },
  { icon: MessageSquare, title: "WhatsApp Alerts", desc: "Get instant alerts directly on your phone" },
  { icon: Plug, title: "No Hardware Change", desc: "Works with your existing CCTV setup" },
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Core <span className="text-gradient">Features</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-6 glow-hover transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
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
