import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCaseCategories } from "@/data/useCases";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const UseCaseCard = ({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <div className="glass rounded-2xl overflow-hidden h-full group">
      <div className="relative aspect-[16/9] md:aspect-[16/8] lg:aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={1280}
          height={720}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/60 border border-white/20 px-2.5 py-1">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.95)]" />
          <span className="text-[10px] md:text-[11px] font-bold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            Live AI detection
          </span>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground line-clamp-3">{description}</p>
      </div>
    </div>
  );
};

const CategoryCarousel = ({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; title: string; description: string; image: string }>;
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi || items.length <= 1) {
      return;
    }

    const timerId = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 6000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [carouselApi, items.length]);

  return (
    <div className="glass rounded-2xl p-4 md:p-6 lg:p-7 h-full">
      <div className="mb-4 md:mb-5">
        <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground">{description}</p>
      </div>

      <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-full">
              <UseCaseCard title={item.title} description={item.description} image={item.image} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
};

const UseCases = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showAll, setShowAll] = useState(false);

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
            AI Detection <span className="text-gradient">Use Cases</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {useCaseCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: categoryIndex * 0.08 }}
              className={`h-full ${categoryIndex >= 2 && !showAll ? "hidden md:block" : "block"}`}
            >
              <CategoryCarousel title={category.title} description={category.description} items={category.items} />
            </motion.div>
          ))}
        </div>

        {useCaseCategories.length > 2 && (
          <div className={`mt-12 flex justify-center md:hidden`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 rounded-full glass border-primary/20 text-primary font-bold shadow-glow-primary transition-all flex items-center gap-2"
            >
              {showAll ? "Show Less" : "Show More"}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UseCases;
