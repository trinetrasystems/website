import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HardHat, Flame, Construction, ShieldOff, Package } from "lucide-react";

import helmetImg from "../../videosandphotoes/person_vest_helmet_goggles.PNG";
import fireImg from "../../videosandphotoes/firealert.PNG";
import zoneImg from "../../videosandphotoes/zoneintrusion.PNG";
import accessImg from "../../videosandphotoes/ATM_person_with_mask.PNG";
import loadingImg from "../../videosandphotoes/smart_loading_unloading.PNG";

const useCases = [
  {
    icon: HardHat,
    title: "Safety Compliance Monitoring",
    desc: "Automatically detect PPE violations — helmets, vests, goggles — across your facility.",
    image: helmetImg,
    color: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Flame,
    title: "Fire & Hazard Detection",
    desc: "Instant fire and smoke detection with immediate alerts to prevent catastrophic losses.",
    image: fireImg,
    color: "from-red-500/20 to-orange-500/10",
    iconColor: "text-red-500",
  },
  {
    icon: Construction,
    title: "Restricted Area Monitoring",
    desc: "Get alerted when unauthorized personnel enter restricted or hazardous zones.",
    image: zoneImg,
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: ShieldOff,
    title: "Unauthorized Access Detection",
    desc: "Detect and alert on unauthorized entry attempts across all entry points.",
    image: accessImg,
    color: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Package,
    title: "Warehouse Surveillance",
    desc: "Smart monitoring for loading/unloading, inventory tracking, and warehouse safety.",
    image: loadingImg,
    color: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
  },
];

const FactoryUseCases = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="factory-usecases" className="py-16 md:py-28 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            🏭 Industries
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Built for <span className="text-gradient">Factories & Warehouses</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Purpose-built AI detection models for industrial safety and operations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group hover:border-primary/20 transition-all duration-500"
            >
              {uc.image && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={uc.image}
                    alt={uc.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 border border-white/20 px-2.5 py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.95)]" />
                    <span className="text-[10px] font-bold tracking-wide text-white">AI Detection</span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${uc.color} flex items-center justify-center shrink-0`}>
                    <uc.icon className={`w-5 h-5 ${uc.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold">{uc.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FactoryUseCases;
