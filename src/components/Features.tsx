import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Shield, Target, LayoutDashboard, MessageCircle, Plug } from "lucide-react";

const features = [
  { icon: Zap, title: "Real-Time Alerts", desc: "Get instant alerts for immediate action", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Shield, title: "On-Premise Processing", desc: "Your data stays inside your facility — no cloud dependency", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Target, title: "Custom AI Detection", desc: "Helmet, fire, intrusion, or any custom use-case", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: LayoutDashboard, title: "Live Dashboard", desc: "Monitor all cameras with real-time insights and event tracking", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: MessageCircle, title: "WhatsApp Alerts", desc: "Get instant alerts directly on your phone", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Plug, title: "No Hardware Change", desc: "Works with your existing CCTV setup", color: "text-indigo-500", bg: "bg-indigo-500/10" },
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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-4 md:p-8 glow-hover transition-all duration-300 group"
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-5 h-5 md:w-7 md:h-7 ${f.color}`} />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-2 md:mb-3 line-clamp-1 md:line-clamp-none">{f.title}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
