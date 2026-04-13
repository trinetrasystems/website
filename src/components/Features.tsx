import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, ShieldCheck, Crosshair, LayoutDashboard, MessageCircle, Plug } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Near Real-Time Alerts",
    desc: "Get instant alerts with minimal delay for immediate action.",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500",
    borderHover: "hover:border-amber-500/30",
  },
  {
    icon: ShieldCheck,
    title: "On-Premise Processing",
    desc: "Your data stays inside your facility — no cloud dependency.",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    icon: Crosshair,
    title: "Custom AI Detection",
    desc: "Helmet, fire, intrusion, or any custom use-case.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/30",
  },
  {
    icon: LayoutDashboard,
    title: "Live Dashboard",
    desc: "Monitor all cameras with real-time insights and event tracking.",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    borderHover: "hover:border-blue-500/30",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Alerts",
    desc: "Get instant alerts directly on your phone.",
    gradient: "from-green-500/20 to-emerald-500/10",
    iconColor: "text-green-500",
    borderHover: "hover:border-green-500/30",
  },
  {
    icon: Plug,
    title: "No Hardware Change",
    desc: "Works with your existing CCTV setup.",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-500/30",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-16 md:py-28 px-4 md:px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Core <span className="text-gradient">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for intelligent, automated safety monitoring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass rounded-2xl p-7 glow-hover transition-all duration-500 group border-white/5 ${f.borderHover}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <f.icon className={`w-7 h-7 ${f.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
