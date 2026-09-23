import { motion, useInView } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import SectionHeader from "./SectionHeader";
import { useRef } from "react";

const industryImages = [
  "/industries/1.jpg",
  "/industries/2.jpg",
  "/industries/3.jpg",
  "/industries/4.jpg",
  "/industries/5.jpg",
];

// Render the list twice so the CSS marquee can loop seamlessly: the track is
// translated by -50% (exactly one copy width, since every card carries an equal
// right margin), landing on the identical frame with no visible jump.
const track = [...industryImages, ...industryImages];

const IndustriesWeServe = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="industries" className="py-12 md:py-24 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Who we serve"
          inView={isInView}
          title={<>Industries We <span className="text-gradient">Serve</span></>}
          description={"From residential societies and enterprises to retail and industrial facilities, Trinetra's AI surveillance adapts to every environment."}
        />
      </div>

      {/* Continuously moving black-and-white banner */}
      <motion.div
        {...fadeUp(isInView, 0.2)}
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {track.map((src, i) => (
            <div
              key={i}
              aria-hidden={i >= industryImages.length}
              className="mr-4 md:mr-6 h-36 w-56 md:h-48 md:w-72 shrink-0 overflow-hidden rounded-2xl glass p-3 md:p-4"
            >
              <img
                src={src}
                alt={
                  i < industryImages.length
                    ? "Industry served by Trinetra Systems AI surveillance"
                    : ""
                }
                loading="lazy"
                draggable={false}
                className="h-full w-full object-contain grayscale transition-all duration-500 hover:grayscale-0 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default IndustriesWeServe;
