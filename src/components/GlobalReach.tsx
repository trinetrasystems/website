import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { Shield, Zap, Globe, Radio } from "lucide-react";

// Generate dots that form a recognizable world map shape
// Each dot is [x%, y%] on a 100x50 grid
const continentDots: [number, number][] = [
  // North America
  ...[
    [14,10],[15,10],[16,10],[17,10],[13,11],[14,11],[15,11],[16,11],[17,11],[18,11],
    [12,12],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12],
    [11,13],[12,13],[13,13],[14,13],[15,13],[16,13],[17,13],[18,13],[19,13],
    [11,14],[12,14],[13,14],[14,14],[15,14],[16,14],[17,14],[18,14],[19,14],[20,14],
    [12,15],[13,15],[14,15],[15,15],[16,15],[17,15],[18,15],[19,15],[20,15],
    [13,16],[14,16],[15,16],[16,16],[17,16],[18,16],[19,16],[20,16],
    [14,17],[15,17],[16,17],[17,17],[18,17],[19,17],[20,17],[21,17],
    [15,18],[16,18],[17,18],[18,18],[19,18],[20,18],[21,18],
    [16,19],[17,19],[18,19],[19,19],[20,19],
    [17,20],[18,20],[19,20],[20,20],[21,20],
    [18,21],[19,21],[20,21],[21,21],
    [19,22],[20,22],[21,22],
    [20,23],[21,23],[22,23],
    [21,24],[22,24],
  ] as [number, number][],
  // Central America / Caribbean
  ...[
    [21,25],[22,25],[23,25],
    [22,26],[23,26],
    [22,27],[23,27],[24,27],
  ] as [number, number][],
  // South America
  ...[
    [25,28],[26,28],[27,28],[28,28],
    [25,29],[26,29],[27,29],[28,29],[29,29],
    [25,30],[26,30],[27,30],[28,30],[29,30],[30,30],
    [25,31],[26,31],[27,31],[28,31],[29,31],[30,31],
    [26,32],[27,32],[28,32],[29,32],[30,32],
    [26,33],[27,33],[28,33],[29,33],[30,33],
    [27,34],[28,34],[29,34],[30,34],
    [27,35],[28,35],[29,35],[30,35],
    [28,36],[29,36],[30,36],
    [28,37],[29,37],[30,37],
    [29,38],[30,38],
    [29,39],[30,39],
    [30,40],[30,41],
  ] as [number, number][],
  // Europe
  ...[
    [44,10],[45,10],[46,10],[47,10],[48,10],
    [43,11],[44,11],[45,11],[46,11],[47,11],[48,11],[49,11],[50,11],
    [42,12],[43,12],[44,12],[45,12],[46,12],[47,12],[48,12],[49,12],[50,12],[51,12],
    [43,13],[44,13],[45,13],[46,13],[47,13],[48,13],[49,13],[50,13],[51,13],
    [44,14],[45,14],[46,14],[47,14],[48,14],[49,14],[50,14],
    [44,15],[45,15],[46,15],[47,15],[48,15],[49,15],
    [45,16],[46,16],[47,16],[48,16],[49,16],
    [45,17],[46,17],[47,17],[48,17],
    [46,18],[47,18],
  ] as [number, number][],
  // Africa
  ...[
    [46,20],[47,20],[48,20],[49,20],[50,20],
    [45,21],[46,21],[47,21],[48,21],[49,21],[50,21],[51,21],
    [44,22],[45,22],[46,22],[47,22],[48,22],[49,22],[50,22],[51,22],[52,22],
    [44,23],[45,23],[46,23],[47,23],[48,23],[49,23],[50,23],[51,23],[52,23],
    [45,24],[46,24],[47,24],[48,24],[49,24],[50,24],[51,24],[52,24],
    [45,25],[46,25],[47,25],[48,25],[49,25],[50,25],[51,25],[52,25],
    [46,26],[47,26],[48,26],[49,26],[50,26],[51,26],[52,26],
    [46,27],[47,27],[48,27],[49,27],[50,27],[51,27],
    [47,28],[48,28],[49,28],[50,28],[51,28],
    [47,29],[48,29],[49,29],[50,29],[51,29],
    [48,30],[49,30],[50,30],[51,30],
    [48,31],[49,31],[50,31],
    [49,32],[50,32],
    [49,33],[50,33],
    [50,34],
  ] as [number, number][],
  // Russia / Northern Asia
  ...[
    [52,10],[53,10],[54,10],[55,10],[56,10],[57,10],[58,10],[59,10],[60,10],
    [61,10],[62,10],[63,10],[64,10],[65,10],[66,10],[67,10],[68,10],
    [52,11],[53,11],[54,11],[55,11],[56,11],[57,11],[58,11],[59,11],[60,11],
    [61,11],[62,11],[63,11],[64,11],[65,11],[66,11],[67,11],[68,11],[69,11],
    [52,12],[53,12],[54,12],[55,12],[56,12],[57,12],[58,12],[59,12],[60,12],
    [61,12],[62,12],[63,12],[64,12],[65,12],[66,12],[67,12],[68,12],[69,12],[70,12],
    [53,13],[54,13],[55,13],[56,13],[57,13],[58,13],[59,13],[60,13],
    [61,13],[62,13],[63,13],[64,13],[65,13],[66,13],[67,13],[68,13],[69,13],
  ] as [number, number][],
  // Middle East
  ...[
    [52,17],[53,17],[54,17],[55,17],[56,17],
    [52,18],[53,18],[54,18],[55,18],[56,18],[57,18],
    [53,19],[54,19],[55,19],[56,19],[57,19],
    [54,20],[55,20],
  ] as [number, number][],
  // India & South Asia
  ...[
    [60,17],[61,17],[62,17],[63,17],
    [60,18],[61,18],[62,18],[63,18],[64,18],
    [61,19],[62,19],[63,19],[64,19],
    [62,20],[63,20],[64,20],
    [62,21],[63,21],[64,21],
    [63,22],[64,22],
    [63,23],[64,23],
    [64,24],
  ] as [number, number][],
  // China / East Asia
  ...[
    [64,14],[65,14],[66,14],[67,14],[68,14],[69,14],[70,14],
    [64,15],[65,15],[66,15],[67,15],[68,15],[69,15],[70,15],[71,15],
    [65,16],[66,16],[67,16],[68,16],[69,16],[70,16],[71,16],
    [66,17],[67,17],[68,17],[69,17],[70,17],[71,17],
    [67,18],[68,18],[69,18],[70,18],
    [68,19],[69,19],[70,19],
  ] as [number, number][],
  // Japan / Korea
  ...[
    [73,14],[74,14],
    [73,15],[74,15],
    [73,16],[74,16],
    [74,17],
  ] as [number, number][],
  // Southeast Asia
  ...[
    [66,22],[67,22],[68,22],[69,22],
    [67,23],[68,23],[69,23],[70,23],
    [68,24],[69,24],[70,24],[71,24],
    [69,25],[70,25],[71,25],
    [70,26],[71,26],[72,26],
  ] as [number, number][],
  // Australia
  ...[
    [74,32],[75,32],[76,32],[77,32],[78,32],
    [73,33],[74,33],[75,33],[76,33],[77,33],[78,33],[79,33],
    [73,34],[74,34],[75,34],[76,34],[77,34],[78,34],[79,34],[80,34],
    [73,35],[74,35],[75,35],[76,35],[77,35],[78,35],[79,35],[80,35],
    [74,36],[75,36],[76,36],[77,36],[78,36],[79,36],[80,36],
    [75,37],[76,37],[77,37],[78,37],[79,37],
    [76,38],[77,38],[78,38],
  ] as [number, number][],
  // New Zealand
  ...[
    [82,37],[83,37],
    [82,38],[83,38],
    [83,39],
  ] as [number, number][],
];

// Highlighted "pulse" dots — key cities / regions for amber glow
const pulseDots: { x: number; y: number; delay: number; isHQ?: boolean }[] = [
  // North America
  { x: 16, y: 15, delay: 0 },
  { x: 19, y: 20, delay: 1.2 },
  { x: 14, y: 12, delay: 2.4 },
  // South America
  { x: 27, y: 30, delay: 0.6 },
  { x: 29, y: 36, delay: 1.8 },
  // Europe
  { x: 47, y: 13, delay: 0.3 },
  { x: 45, y: 15, delay: 1.5 },
  { x: 50, y: 12, delay: 2.7 },
  // Africa
  { x: 48, y: 24, delay: 0.9 },
  { x: 50, y: 30, delay: 2.1 },
  // Middle East
  { x: 55, y: 18, delay: 0.4 },
  // India — HQ
  { x: 63, y: 20, delay: 0, isHQ: true },
  // East Asia
  { x: 68, y: 16, delay: 0.7 },
  { x: 73, y: 15, delay: 1.9 },
  // Southeast Asia
  { x: 69, y: 24, delay: 1.1 },
  // Australia
  { x: 77, y: 35, delay: 1.4 },
];

const valueProps = [
  {
    icon: Shield,
    title: "100% On-Premise",
    desc: "Your data never leaves your facility — works without internet, in any country",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Deploy in Days",
    desc: "Plug into any existing CCTV system — no infrastructure changes, anywhere",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/20",
  },
  {
    icon: Globe,
    title: "Any Camera, Any Country",
    desc: "Compatible with all major camera brands — no geographical limits",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/20",
  },
];

const GlobalReach = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Memoize the continent dots so they don't re-render
  const renderedMapDots = useMemo(
    () =>
      continentDots.map(([x, y], i) => (
        <circle
          key={`map-${i}`}
          cx={x}
          cy={y}
          r="0.35"
          className="fill-foreground/[0.12] dark:fill-foreground/[0.08]"
        />
      )),
    []
  );

  return (
    <section
      id="global-reach"
      className="py-16 md:py-28 px-4 md:px-6 relative overflow-hidden bg-gradient-dark"
      ref={ref}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-amber-500/20 mb-6 text-sm font-semibold">
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-amber-500">Ready to Deploy Worldwide</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            AI Surveillance That{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Works Anywhere
            </span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Our on-premise AI solution deploys in any country, on any camera
            system — no cloud dependency, no geographical limits, no boundaries.
          </p>
        </motion.div>

        {/* World Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative glass rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 lg:p-10 mb-10 md:mb-14 border-white/[0.06] overflow-hidden"
        >
          {/* Ambient glow behind the map */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/[0.06] dark:bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[250px] h-[180px] bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />

          {/* SVG Map */}
          <div className="relative w-full">
            <svg
              viewBox="6 6 82 40"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background continent dots */}
              {renderedMapDots}

              {/* Connection lines from India HQ to other pulse dots */}
              {pulseDots
                .filter((d) => !d.isHQ)
                .map((dot, i) => (
                  <motion.line
                    key={`line-${i}`}
                    x1={63}
                    y1={20}
                    x2={dot.x}
                    y2={dot.y}
                    stroke="url(#amberGradient)"
                    strokeWidth="0.08"
                    strokeDasharray="0.5 0.8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      isInView ? { pathLength: 1, opacity: 0.6 } : {}
                    }
                    transition={{
                      duration: 1.2,
                      delay: 0.8 + i * 0.12,
                      ease: "easeOut",
                    }}
                  />
                ))}

              {/* Pulse dots — glowing amber circles on key locations */}
              {pulseDots.map((dot, i) => (
                <g key={`pulse-${i}`}>
                  {/* Outer glow ring */}
                  <motion.circle
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.isHQ ? 1.8 : 1}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.08"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      isInView
                        ? {
                            opacity: [0, 0.6, 0],
                            scale: [0.5, 1.5, 2],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2.5,
                      delay: 1 + dot.delay,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
                  />
                  {/* Inner dot */}
                  <motion.circle
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.isHQ ? 0.7 : 0.45}
                    fill="#f59e0b"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.6 + i * 0.08,
                      ease: "backOut",
                    }}
                    style={{
                      filter: dot.isHQ
                        ? "drop-shadow(0 0 3px rgba(245, 158, 11, 0.8))"
                        : "drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))",
                    }}
                  />
                  {/* Second ripple for HQ */}
                  {dot.isHQ && (
                    <motion.circle
                      cx={dot.x}
                      cy={dot.y}
                      r={2.5}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="0.06"
                      initial={{ opacity: 0 }}
                      animate={
                        isInView
                          ? {
                              opacity: [0, 0.4, 0],
                              scale: [0.5, 1.2, 1.8],
                            }
                          : {}
                      }
                      transition={{
                        duration: 3,
                        delay: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      style={{
                        transformOrigin: `${dot.x}px ${dot.y}px`,
                      }}
                    />
                  )}
                </g>
              ))}

              {/* HQ Label */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <rect
                  x="64.5"
                  y="18.5"
                  width="7"
                  height="2.2"
                  rx="0.6"
                  fill="#f59e0b"
                  fillOpacity="0.15"
                  stroke="#f59e0b"
                  strokeWidth="0.08"
                  strokeOpacity="0.4"
                />
                <text
                  x="68"
                  y="20"
                  textAnchor="middle"
                  className="fill-amber-500 dark:fill-amber-400"
                  fontSize="1.1"
                  fontWeight="bold"
                  fontFamily="'Outfit', sans-serif"
                  letterSpacing="0.08"
                >
                  HQ · INDIA
                </text>
              </motion.g>

              {/* Gradient definitions */}
              <defs>
                <linearGradient
                  id="amberGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#f59e0b"
                    stopOpacity="0.7"
                  />
                  <stop
                    offset="100%"
                    stopColor="#f59e0b"
                    stopOpacity="0.15"
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {valueProps.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
              className={`glass rounded-2xl p-5 md:p-8 text-center glow-hover transition-all duration-300 group border-white/5 ${prop.borderHover} ${i === 2 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${prop.bg} flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <prop.icon
                  className={`w-6 h-6 md:w-8 md:h-8 ${prop.color}`}
                />
              </div>
              <h3 className="text-xs md:text-xl font-bold mb-1 md:mb-2">
                {prop.title}
              </h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">
                {prop.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;
