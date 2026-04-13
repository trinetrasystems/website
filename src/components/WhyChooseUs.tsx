import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Settings2, Zap, Server, Timer, BadgeDollarSign, CheckCircle2 } from "lucide-react";

const differentiators = [
  { icon: Settings2, text: "Fully customizable AI (not fixed features)", desc: "Tailor detection models to your exact requirements and environment." },
  { icon: Zap, text: "Near real-time alerts (not delayed cloud alerts)", desc: "On-premise processing eliminates cloud round-trip delays." },
  { icon: Server, text: "On-device processing (complete privacy)", desc: "Your video data never leaves your facility. Ever." },
  { icon: Timer, text: "Faster deployment than enterprise solutions", desc: "Go live in 3–5 days, not months of configuration." },
  { icon: BadgeDollarSign, text: "Cost-effective and scalable", desc: "Affordable setup with flexible per-camera pricing that grows with you." },
];

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-trinetra" className="py-16 md:py-28 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why <span className="text-gradient">Trinetra Systems</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            What sets us apart from traditional and cloud-based solutions.
          </p>
        </motion.div>

        <div className="space-y-4">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.text}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex items-start gap-5 group hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <d.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <h3 className="text-base md:text-lg font-bold">{d.text}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
