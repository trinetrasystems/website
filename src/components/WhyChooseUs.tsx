import { motion, useInView } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import SectionHeader from "./SectionHeader";
import { useRef } from "react";
import { CheckCircle } from "lucide-react";

const reasons = [
  { title: "Fully customizable AI", desc: "Not fixed features, we build what you need" },
  { title: "Real-time alerts", desc: "No delayed cloud alerts, instant notifications" },
  { title: "On-device processing", desc: "Complete privacy, data never leaves your premises" },
  { title: "Faster deployment than enterprise solutions", desc: "Ready in days, not months" },
  { title: "Cost-effective and scalable", desc: "Affordable solutions that grow with your business" },
];

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-choose-us" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          eyebrow="Why Trinetra"
          inView={isInView}
          title={<>Why Choose <span className="text-gradient">Trinetra Systems</span> for Smart Surveillance</>}
        />

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              {...fadeUp(isInView, stagger(i))}
              className={`flex items-start gap-3 md:gap-4 glass p-4 md:p-6 rounded-2xl hover:bg-secondary/30 transition-colors border-white/5 ${i === 4 ? 'col-span-2 md:col-span-1 mx-auto max-w-[60%] md:max-w-none' : ''}`}
            >
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm md:text-xl font-bold mb-1">{r.title}</h3>
                <p className="text-[10px] md:text-base text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
