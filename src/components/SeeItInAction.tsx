import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import dashboardImg from "../../videosandphotoes/Person_monitoring_office_sleeping_talking.PNG";
import ppeImg from "../../videosandphotoes/person_vest_helmet_goggles.PNG";
import fireImg from "../../videosandphotoes/firealert.PNG";

const categories = ["All", "Dashboard", "Detection", "Alert"];

const items = [
  { id: 1, title: "Live AI Dashboard", category: "Dashboard", desc: "Real-time monitoring with intelligent event tracking and camera management.", img: dashboardImg },
  { id: 2, title: "PPE Compliance Detection", category: "Detection", desc: "Automatic helmet, vest, and goggles detection on workers.", img: ppeImg },
  { id: 3, title: "Fire & Smoke Alert", category: "Alert", desc: "Instant fire detection alert with location and severity information.", img: fireImg },
];

const SeeItInAction = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category === activeCategory);

  return (
    <section id="see-it-in-action" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-4">
            Real screenshots from our live deployments — dashboards, detections, and alerts.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                  : "bg-secondary/20 text-muted-foreground border-white/5 hover:bg-secondary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group border-white/5 flex flex-col h-full"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.category}</span>
                </div>
              </div>
              <div className="p-4 md:p-6 flex-grow flex flex-col">
                <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeeItInAction;
