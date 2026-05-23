import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Brain, Zap, ShieldCheck, AlertTriangle } from "lucide-react";

const problems = [
  "Manual monitoring is unreliable",
  "Critical events are missed",
  "No real-time alerts",
  "High risk of accidents and losses",
  "Data privacy concerns with cloud systems",
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-12 md:py-24 px-4 md:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why <span className="text-red-500">Traditional CCTV</span> Fails at AI Detection
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Traditional CCTV relies on manual monitoring — our AI camera analytics and smart surveillance platform detects incidents automatically in real time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="glass rounded-[2rem] p-8 md:p-12 border-red-500/20 bg-red-500/5 shadow-xl"
        >
          <div className="space-y-6">
            {problems.map((p, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground/90">{p}</h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
