import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, ShoppingCart, Factory, HardHat } from "lucide-react";

const solutions = [
  {
    icon: Camera,
    title: "Smart Surveillance",
    description: "AI-powered video analytics for real-time threat detection, behavioral analysis, and automated response across all camera feeds.",
  },
  {
    icon: ShoppingCart,
    title: "Retail Intelligence",
    description: "Customer behavior analytics, theft prevention, heatmap tracking, and automated checkout powered by computer vision.",
  },
  {
    icon: Factory,
    title: "Industrial Automation",
    description: "Production line monitoring, quality control, anomaly detection, and predictive maintenance using visual AI.",
  },
  {
    icon: HardHat,
    title: "Safety & Compliance",
    description: "Automated PPE detection, zone monitoring, fall detection, and safety compliance verification in real-time.",
  },
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
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Our <span className="text-gradient">Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive AI-powered solutions tailored for every industry and use case.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass rounded-2xl p-8 glow-hover transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
