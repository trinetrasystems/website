import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, BarChart3, Megaphone, Building2, CheckCircle2, ArrowRight } from "lucide-react";

const solutionPages = [
  {
    title: "AI Surveillance",
    description: "Real-time AI monitoring across every camera with instant alerts.",
    href: "/ai-surveillance",
    icon: Shield,
  },
  {
    title: "Workplace Analytics",
    description: "Desk, meeting room & cafeteria utilization from existing CCTV.",
    href: "/workplace-analytics",
    icon: BarChart3,
  },
  {
    title: "Billboard Analytics",
    description: "Dual-camera attention scoring that makes OOH media measurable.",
    href: "/billboard-analytics",
    icon: Megaphone,
  },
  {
    title: "Residential Security",
    description: "AI-powered protection for societies, gated communities & homes.",
    href: "/residential-cctv-ai-surveillance",
    icon: Building2,
  },
];

const highlights = [
  "Automatically monitors all cameras",
  "Sends Real-Time Alerts",
  "Runs completely on your premises",
  "Reduces risks, accidents, and manual effort",
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
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI Surveillance Solutions That <span className="text-gradient">Work For You</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Purpose-built, on-premise AI for every environment — explore the solution that fits your site.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
          {solutionPages.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <Link
                to={s.href}
                className="group flex flex-col h-full glass rounded-2xl p-6 border-white/5 hover:border-primary/40 hover:shadow-glow-primary transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {s.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 max-w-4xl mx-auto"
        >
          {highlights.map((h) => (
            <div key={h} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm md:text-base font-semibold">{h}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;
