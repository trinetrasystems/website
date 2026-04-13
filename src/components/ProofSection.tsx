import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MonitorCheck, Bell, Eye } from "lucide-react";

import dashboardDark from "../../videosandphotoes/dark.PNG";
import fireAlert from "../../videosandphotoes/firealert.PNG";
import helmetDetection from "../../videosandphotoes/person_vest_helmet_goggles.PNG";
import zoneIntrusion from "../../videosandphotoes/zoneintrusion.PNG";
import fallDetection from "../../videosandphotoes/Person_fall_detection.PNG";
import attendanceMonitoring from "../../videosandphotoes/attendence_monitoring.PNG";

const proofItems = [
  {
    category: "Dashboard",
    icon: MonitorCheck,
    title: "Live AI Dashboard",
    desc: "Real-time monitoring with intelligent event tracking and camera management.",
    image: dashboardDark,
  },
  {
    category: "Detection",
    icon: Eye,
    title: "PPE Compliance Detection",
    desc: "Automatic helmet, vest, and goggles detection on workers.",
    image: helmetDetection,
  },
  {
    category: "Alert",
    icon: Bell,
    title: "Fire & Smoke Alert",
    desc: "Instant fire detection alert with location and severity information.",
    image: fireAlert,
  },
  {
    category: "Detection",
    icon: Eye,
    title: "Zone Intrusion Detection",
    desc: "Unauthorized entry detection in restricted areas.",
    image: zoneIntrusion,
  },
  {
    category: "Detection",
    icon: Eye,
    title: "Fall Detection",
    desc: "Automatic person fall detection for immediate emergency response.",
    image: fallDetection,
  },
  {
    category: "Dashboard",
    icon: MonitorCheck,
    title: "Attendance Monitoring",
    desc: "AI-powered attendance tracking from camera feeds.",
    image: attendanceMonitoring,
  },
];

const ProofSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("All");
  const categories = ["All", "Dashboard", "Detection", "Alert"];

  const filtered = activeFilter === "All" ? proofItems : proofItems.filter((p) => p.category === activeFilter);

  return (
    <section id="proof" className="py-16 md:py-28 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Real screenshots from our live deployments — dashboards, detections, and alerts.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "glass hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              layout
              className="glass rounded-2xl overflow-hidden group hover:border-primary/20 transition-all duration-500"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 border border-white/20 px-2.5 py-1">
                  <item.icon className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold tracking-wide text-white">{item.category}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProofSection;
