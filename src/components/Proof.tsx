import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dashboardImg from "../../videosandphotoes/Person_monitoring_office_sleeping_talking.PNG";
import detectionImg from "../../videosandphotoes/Person_fall_detection.PNG";
import alertImg from "../../videosandphotoes/firealert.PNG";

const Proof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const proofItems = [
    { title: "Dashboard Screenshot", type: "Dashboard", img: dashboardImg },
    { title: "Detection Image", type: "Detection", img: detectionImg },
    { title: "Alert Example", type: "Alert", img: alertImg },
  ];

  return (
    <section id="proof" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Real-World <span className="text-gradient">Performance</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {proofItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group border-white/5 relative"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div>
                    <p className="text-white font-bold text-lg mb-1">{item.title}</p>
                    <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Real-time {item.type}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Proof;
