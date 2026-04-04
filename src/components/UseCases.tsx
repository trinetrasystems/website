import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useCases } from "@/data/useCases";
import { ChevronDown } from "lucide-react";

const images: Record<string, string> = import.meta.glob("@/assets/usecases/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

const getImage = (key: string): string => {
  const entry = Object.entries(images).find(([path]) => path.includes(key));
  return entry ? entry[1] : "";
};

const UseCaseCard = ({ title, description, image, index }: { title: string; description: string; image: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
      className="glass rounded-xl overflow-hidden group cursor-pointer glow-hover transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={getImage(image)}
          alt={title}
          loading="lazy"
          width={1024}
          height={576}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xs md:text-base font-bold mb-1 line-clamp-1">{title}</h3>
          <p className="text-[10px] md:text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const UseCases = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showAll, setShowAll] = useState(false);

  // On mobile (< sm), show 6 items (2 cols × 3 rows), on larger screens show all
  const MOBILE_LIMIT = 6;

  return (
    <section id="usecases" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="text-gradient">Use Cases</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            From security to retail to industrial automation — see how Trinetra transforms video feeds into actionable intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {useCases.map((uc, i) => {
            // On mobile, hide items beyond limit unless showAll is true
            const hiddenOnMobile = !showAll && i >= MOBILE_LIMIT;
            return (
              <div key={uc.id} className={hiddenOnMobile ? "hidden sm:block" : ""}>
                <UseCaseCard {...uc} index={i} />
              </div>
            );
          })}
        </div>

        {/* Show More button - only visible on mobile when not all shown */}
        {!showAll && (
          <div className="sm:hidden flex justify-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg glass text-sm font-semibold text-foreground glow-hover transition-all"
            >
              Show More
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UseCases;
