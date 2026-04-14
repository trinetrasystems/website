import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import dashboardImg from "../../videosandphotoes/dashboard_preview.PNG";
import ppeImg from "../../videosandphotoes/person_vest_helmet_goggles.PNG";
import zoneImg from "../../videosandphotoes/zoneintrusion.PNG";
import fireAlertImg from "../../videosandphotoes/fire_alert_whatsapp.PNG";

const categories = ["All", "Dashboard", "Detection", "Alert"];

const items = [
  { id: 1, title: "Live AI Dashboard", category: "Dashboard", desc: "Real-time monitoring with intelligent event tracking, camera feeds, and alert management.", img: dashboardImg },
  { id: 2, title: "PPE Compliance Detection", category: "Detection", desc: "Automatic helmet, vest, and goggles detection on workers in real time.", img: ppeImg },
  { id: 3, title: "Zone Intrusion Detection", category: "Detection", desc: "Instant alerts when unauthorized personnel enter restricted zones.", img: zoneImg },
  { id: 4, title: "Fire & Smoke Alert", category: "Alert", desc: "Instant WhatsApp fire detection alert with location and severity information.", img: fireAlertImg },
];

type SelectedItem = { title: string; img: string; desc: string } | null;

const SeeItInAction = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter(item => item.category === activeCategory);

  const gridCols = filteredItems.length === 1
    ? "grid-cols-1 max-w-lg mx-auto"
    : filteredItems.length === 2
      ? "grid-cols-2 max-w-5xl mx-auto"
      : "grid-cols-2 lg:grid-cols-4";

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
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                  : "bg-secondary/20 text-muted-foreground border-white/5 hover:bg-secondary/40"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid ${gridCols} gap-3 md:gap-6`}>
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group border-white/5 flex flex-col h-full cursor-pointer"
              onClick={() => setSelectedItem(item)}
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
                {/* Zoom overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
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

      {/* Image Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-xl backdrop-blur-md"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={selectedItem.img}
                alt={selectedItem.title}
                className="w-full h-auto max-h-[80vh] object-contain bg-black/90"
              />
            </div>
            {/* Caption */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-white drop-shadow-lg">{selectedItem.title}</h3>
              <p className="text-sm text-white/60 mt-1">{selectedItem.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SeeItInAction;
