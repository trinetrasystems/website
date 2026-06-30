import { motion } from "framer-motion";
import {
  CheckCircle2, Camera, Eye, Users, BarChart3, ShieldCheck,
  Cpu, Cloud, Lock, MapPin, Gauge, CloudSun, CalendarDays,
  TrendingUp, Smartphone, Monitor, FileBarChart, Radio, Trophy,
  Building2, Megaphone, Briefcase, LandPlot, Zap, Server,
  Filter, Flame, Clock, Crosshair
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import SEOHead from "@/components/SEOHead";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay },
});

const BillboardAnalytics = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="AI Billboard Attention Analytics | Out-of-Home Audience Measurement | Trinetra Systems"
      description="Turn every billboard into measurable media. Dual-camera edge AI counts who really sees your ad, scores real attention, verifies proof-of-play, and prices OOH inventory on evidence — 100% on-premise."
      keywords="billboard analytics, out-of-home audience measurement, OOH attention analytics, billboard impression measurement, proof of play, dual camera billboard AI, dynamic OOH pricing, edge AI billboard, Trinetra Systems billboard analytics"
      canonicalPath="/billboard-analytics"
    />
    <AppSidebar />

    <main className="pt-24 lg:pt-32">
      {/* Hero Section */}
      <section className="px-4 md:px-6 mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI-Powered Out-of-Home Analytics
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                Billboard <span className="text-gradient">Attention Analytics</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Two synchronized cameras turn every billboard into measurable media — counting who really sees your ad, scoring genuine attention, and proving what it's worth. 100% edge AI, on-premise by design.
              </p>

              <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
                {[
                  "Dual-Camera Vision",
                  "Edge AI · On-Prem",
                  "Real-Time Attention Scoring",
                  "Proof-of-Play",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-glow-primary transition-all">
                Get a Free Demo
              </a>
            </motion.div>

            <motion.div className="glass p-2 rounded-2xl mt-12" {...fadeUp(0.2)}>
              <img src="/billboard/hero.png" alt="AI billboard attention analytics dashboard turning out-of-home media into measurable data" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Out-of-Home Has a <span className="text-gradient">Measurement Problem</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Billboards reach millions every day — yet advertisers and media owners stay blind on the questions that actually decide value: who saw the ad, and was it worth the spend?
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.1)}>
              <BarChart3 className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Impressions Are Estimated</h3>
              <p className="text-muted-foreground">Footfall and traffic counts are modeled averages — not what truly passed the board.</p>
            </motion.div>
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.2)}>
              <Users className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Audience Is a Guess</h3>
              <p className="text-muted-foreground">No real split of vehicles vs pedestrians, direction of travel, or dwell at the site.</p>
            </motion.div>
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.3)}>
              <Camera className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Proof of Play</h3>
              <p className="text-muted-foreground">No automated check that the right creative was live, lit and unobstructed.</p>
            </motion.div>
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.4)}>
              <TrendingUp className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Pricing Is Flat</h3>
              <p className="text-muted-foreground">Every hour billed the same — ignoring real attention by daypart, weather and events.</p>
            </motion.div>
          </div>

          <motion.div className="glass p-6 md:p-8 rounded-2xl max-w-4xl mx-auto" {...fadeUp(0.2)}>
            <h3 className="text-lg font-bold mb-4 text-center">Questions media buyers can't answer today</h3>
            <ul className="space-y-3">
              {[
                "How many people actually walked past the billboard?",
                "Cars or pedestrians? Heading toward the board or away?",
                "Which hours, days and conditions truly deliver attention?",
                "Did Creative A beat Creative B at this exact location?",
              ].map((q, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-muted-foreground">{q}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-sm font-semibold text-primary mt-6">
              Trinetra turns every one of these unknowns into measured, billable data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Solution — Two Cameras */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Two Cameras. <span className="text-gradient">One Source of Truth.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Trinetra pairs two synchronized cameras at a single billboard site — one trained on the ad, one on the audience — to measure both, live. Every impression, finally measured.
              </p>
              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Camera className="w-7 h-7 text-primary shrink-0" />
                    <h3 className="text-xl font-bold">Camera 1 — Billboard</h3>
                  </div>
                  <p className="text-muted-foreground">Watches the creative: health, compliance and proof-of-play.</p>
                </div>
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-7 h-7 text-primary shrink-0" />
                    <h3 className="text-xl font-bold">Camera 2 — Audience</h3>
                  </div>
                  <p className="text-muted-foreground">Watches the street: counts, classifies and scores attention.</p>
                </div>
              </div>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/dual-camera.png" alt="Dual-camera billboard analytics setup measuring creative health and audience attention" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works — Pipeline */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Dual-Camera <span className="text-gradient">Architecture & AI Pipeline</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Each camera feeds a purpose-built AI stream — then both flow through one real-time pipeline running on edge GPUs at the camera site, with no constant cloud streaming.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div className="glass p-6 md:p-8 rounded-2xl" {...fadeUp(0.1)}>
              <div className="text-xs font-bold text-primary mb-1">CAMERA 1 · BILLBOARD MONITORING</div>
              <h3 className="text-xl font-bold mb-4">Ad Health & Compliance</h3>
              <ul className="space-y-3">
                {[
                  "Creative verification — confirm the right ad is live",
                  "Obstruction, downtime & lighting alerts",
                  "Automated proof-of-play logging",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div className="glass p-6 md:p-8 rounded-2xl" {...fadeUp(0.2)}>
              <div className="text-xs font-bold text-primary mb-1">CAMERA 2 · TRAFFIC & PEOPLE</div>
              <h3 className="text-xl font-bold mb-4">Audience & Attention</h3>
              <ul className="space-y-3">
                {[
                  "YOLO people + vehicle detection & tracking",
                  "Dwell time, gaze direction & distance zones",
                  "Counts by class, hour and daypart",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div className="text-center mb-8" {...fadeUp()}>
            <h3 className="text-sm font-bold tracking-widest text-muted-foreground">THE PIPELINE</h3>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative">
            {[
              { title: "Capture", desc: "RTSP feeds", icon: Radio },
              { title: "Detect", desc: "YOLO vision", icon: Eye },
              { title: "Track", desc: "Object IDs", icon: Crosshair },
              { title: "Measure", desc: "Dwell · Dir · Dist", icon: Gauge },
              { title: "Score", desc: "Attention", icon: BarChart3 },
              { title: "Visualize", desc: "Dashboard", icon: Monitor },
            ].map((step, i) => (
              <motion.div key={i} className="relative z-10 flex flex-col items-center text-center group" {...fadeUp(i * 0.1)}>
                <div className="w-16 h-16 rounded-2xl bg-background border border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p className="text-center text-sm text-muted-foreground mt-12" {...fadeUp(0.2)}>
            Runs on edge GPUs (NVIDIA Jetson) at the camera site — no constant cloud streaming.
          </motion.p>
        </div>
      </section>

      {/* Edge AI / Data Privacy */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Footage <span className="text-gradient">Never Leaves Your Premises</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Every Trinetra solution runs on a dedicated edge device installed at your site. All AI runs locally — your video stream is never uploaded to the cloud, at any cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "On-Device AI", desc: "All detection & analytics run locally on the NVIDIA Jetson — not a remote server.", icon: Cpu },
              { title: "Video Stays On-Site", desc: "Raw camera streams are processed in place; footage never leaves the building.", icon: Server },
              { title: "No Cloud Dependency", desc: "Runs on your local network — no internet upload, no third-party storage.", icon: Cloud },
              { title: "Privacy by Design", desc: "You own and control 100% of your data — compliance-friendly by default.", icon: Lock },
            ].map((card, i) => (
              <motion.div key={i} className="glass p-6 rounded-2xl" {...fadeUp(i * 0.1)}>
                <card.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Measure — Metrics */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Metrics <span className="text-gradient">That Matter</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Not a raw headcount — an AI-weighted view of genuine viewing opportunity at your board.
            </p>
          </motion.div>

          {/* Featured headline metric */}
          <motion.div className="glass p-8 md:p-10 rounded-3xl mb-8 relative overflow-hidden border border-primary/20" {...fadeUp(0.1)}>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                  <Crosshair className="w-3.5 h-3.5" />
                  HEADLINE METRIC
                </div>
                <div className="text-5xl md:text-7xl font-black leading-none mb-3">
                  <span className="text-gradient">125,430</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-lg font-bold uppercase tracking-wide">Attention Score</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 text-green-500 text-sm font-bold">
                    <TrendingUp className="w-4 h-4" /> 18.6%
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-px self-stretch bg-border/60" />
              <p className="flex-1 text-muted-foreground text-center md:text-left max-w-sm">
                The single number that prices a board: an AI-weighted index of <strong className="text-foreground">genuine viewing opportunity</strong> — not a raw headcount. Up 18.6% vs the previous period.
              </p>
            </div>
          </motion.div>

          {/* Supporting metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
            {[
              { value: "125,430", label: "Potential Impressions", delta: "18.6%", icon: Eye },
              { value: "28.4s", label: "Avg Attention Time", delta: "16.3%", icon: Clock },
              { value: "89,247", label: "Total Traffic Count", delta: "12.5%", icon: BarChart3 },
              { value: "18,672", label: "Pedestrians Detected", delta: "20.9%", icon: Users },
              { value: "5–7 PM", label: "Peak Attention Window", delta: "28,452 views", icon: CalendarDays, isWindow: true },
            ].map((m, i) => (
              <motion.div key={i} className="glass p-5 rounded-2xl flex flex-col items-center text-center hover:border-primary/30 transition-colors" {...fadeUp(i * 0.08)}>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1">{m.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3 leading-tight">{m.label}</div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-auto ${m.isWindow ? "bg-primary/10 text-primary" : "bg-green-500/15 text-green-500"}`}>
                  {!m.isWindow && <TrendingUp className="w-3 h-3" />} {m.delta}
                </span>
              </motion.div>
            ))}
          </div>

          {/* How the Attention Score works — ingredient flow */}
          <motion.div className="glass p-6 md:p-10 rounded-3xl" {...fadeUp(0.2)}>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-2">How the Attention Score Works</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Five measured signals are multiplied together — so a board only scores high when people <em>actually had the chance to see it</em>.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-row items-stretch justify-center gap-3 lg:gap-2">
              {[
                { icon: Users, name: "Traffic Count", desc: "How many people passed" },
                { icon: Clock, name: "Dwell Time", desc: "How long they lingered" },
                { icon: MapPin, name: "Distance", desc: "How close to the board" },
                { icon: Crosshair, name: "Direction", desc: "Facing toward it" },
                { icon: Eye, name: "Visibility", desc: "Clear line of sight" },
              ].map((f, i) => (
                <div key={i} className="flex flex-col lg:flex-row items-center gap-3 lg:gap-2">
                  <div className="flex flex-col items-center text-center bg-background border border-primary/20 rounded-2xl p-4 w-full lg:w-36 h-full">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-bold text-sm mb-1">{f.name}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{f.desc}</div>
                  </div>
                  {i < 4 && <span className="text-primary font-black text-xl shrink-0">×</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <span className="text-primary font-black text-2xl">=</span>
              <span className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary">
                Attention Score
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Command Center — Dashboard */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                One Dashboard, <span className="text-gradient">Total Visibility</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every board, every metric, in one command center. Filter any date and time window — the whole board recomputes instantly.
              </p>
              <ul className="space-y-4">
                {[
                  "Live KPIs — attention, impressions, traffic & peak windows at a glance",
                  "Attention heatmaps — spatial + hourly grids show when and where eyes land",
                  "Traffic & direction split — vehicle-class mix, approach direction & distance bands",
                  "Dayparts & top hours — morning-to-night performance with best hours ranked",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/dashboard.png" alt="Billboard analytics command center dashboard showing live KPIs, attention and traffic" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Flexible Filtering */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/filtering.png" alt="Flexible date and time filtering for billboard analytics with period comparison" className="w-full h-auto rounded-xl" />
            </motion.div>
            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                See Any Data, <span className="text-gradient">for Any Time Period</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Slice the data however you need. Pick a preset, a custom range, or a comparison period — every chart and KPI updates instantly.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Filter, title: "One-tap presets", desc: "Today, Yesterday, Last 7/30 days, This Month, This Year & more." },
                  { icon: CalendarDays, title: "Any custom range", desc: "Pick exact start & end dates — by day, month, quarter or year." },
                  { icon: TrendingUp, title: "Period comparison", desc: "Auto-compare against the previous period to see growth at a glance." },
                  { icon: FileBarChart, title: "Export & report", desc: "Download a full report of the filtered view in a single click." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-6 h-6 text-primary shrink-0" />
                    <span><strong>{item.title}</strong> — {item.desc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Attention Heatmaps */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                See Exactly <span className="text-gradient">Where the People Go</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every detected viewer feeds a live attention heatmap — turning raw footage into a visual map of real-world gaze.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Flame, title: "Spatial heatmap", desc: "Hot zones reveal the lanes and footpaths delivering most attention." },
                  { icon: CalendarDays, title: "Day × hour grid", desc: "A week-long heat grid pinpoints peak attention by day and time." },
                  { icon: Users, title: "People + vehicles", desc: "Separate live counts for foot traffic and each vehicle class." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-6 h-6 text-primary shrink-0" />
                    <span><strong>{item.title}</strong> — {item.desc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/heatmap.png" alt="Billboard attention heatmap showing spatial hot zones and day by hour grid" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Justification */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/value-justification.png" alt="Value justification linking weather, events and traffic speed to billboard attention and dynamic pricing" className="w-full h-auto rounded-xl" />
            </motion.div>
            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prove the Worth of <span className="text-gradient">Every Rupee</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Tie attention to the real-world conditions that drive it — and price inventory on evidence, not guesswork.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: CloudSun, title: "Weather", desc: "Clear days lift attention; rain & fog cut it sharply." },
                  { icon: CalendarDays, title: "Events & holidays", desc: "Matches, festivals & weekends measurably boost views." },
                  { icon: Gauge, title: "Speed → exposure", desc: "Slower traffic = longer dwell; best at 0–40 km/h." },
                  { icon: TrendingUp, title: "Dynamic pricing", desc: "Premium rates for prime dayparts (62% of attention)." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-6 h-6 text-primary shrink-0" />
                    <span><strong>{item.title}</strong> — {item.desc}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Creative A/B Testing */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Find the Creative <span className="text-gradient">That Wins</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Run two creatives on the same board and audience — then let real attention decide the winner.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass p-5 rounded-2xl text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1">AD A · Shoe · 6–12 AM</div>
                  <div className="text-2xl font-black">125,430</div>
                  <div className="text-xs text-muted-foreground mb-2">attention score</div>
                  <div className="text-sm font-semibold">28.4s avg dwell</div>
                </div>
                <div className="glass p-5 rounded-2xl text-center border border-primary/40">
                  <div className="text-xs font-bold text-primary mb-1">AD B · Watch · 2–8 PM</div>
                  <div className="text-2xl font-black text-gradient">158,742</div>
                  <div className="text-xs text-muted-foreground mb-2">attention score</div>
                  <div className="text-sm font-semibold">36.7s avg dwell</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-primary shrink-0" />
                <span className="font-bold">Winner: Ad B — ▲26.6% attention · ▲37.9% dwell</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <span className="text-muted-foreground"><strong>Schedule what works</strong> — place the stronger creative in its peak window; rotate the rest.</span>
              </div>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/ab-testing.png" alt="Creative A/B testing for billboards comparing attention scores and dwell time" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App + Web Dashboard */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/billboard/mobile-app.png" alt="Trinetra billboard analytics mobile app and web dashboard with one secure login" className="w-full h-auto rounded-xl" />
            </motion.div>
            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mobile App + Web Dashboard, <span className="text-gradient">One Login</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your analytics travel with you. View everything in a secure browser dashboard, or check live numbers and alerts on the Trinetra mobile app — all from one account.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Smartphone className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold">Mobile App</h3>
                    <p className="text-muted-foreground">Live KPIs, alerts & board health on the go. Push notifications · iOS &amp; Android.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Monitor className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold">Web Dashboard</h3>
                    <p className="text-muted-foreground">Full analytics, reports & multi-board view. Role-based secure login · export &amp; share.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products & Markets */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Data Products & <span className="text-gradient">Who They're For</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp(0.1)}>
              <h3 className="text-sm font-bold tracking-widest text-primary mb-6">WHAT WE DELIVER</h3>
              <div className="space-y-4">
                {[
                  { icon: FileBarChart, title: "Impression & Attention Reports", desc: "Verified daily and period reports per board, ready for media plans." },
                  { icon: BarChart3, title: "Audience Analytics Feed", desc: "Class, direction, distance & daypart breakdowns via dashboard or API." },
                  { icon: TrendingUp, title: "Dynamic Pricing Insights", desc: "Attention-based rate cards for premium daypart and event pricing." },
                  { icon: ShieldCheck, title: "Compliance & Proof-of-Play", desc: "Automated evidence the right creative ran — lit and unobstructed." },
                ].map((item, i) => (
                  <div key={i} className="glass p-5 rounded-2xl flex items-start gap-4">
                    <item.icon className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)}>
              <h3 className="text-sm font-bold tracking-widest text-primary mb-6">WHO IT'S FOR</h3>
              <div className="space-y-4">
                {[
                  { icon: Building2, title: "Media Owners", desc: "Prove inventory value & justify premium rates." },
                  { icon: Megaphone, title: "Brands & Advertisers", desc: "Measure real ROI and optimize creative." },
                  { icon: Briefcase, title: "Agencies", desc: "Independent, evidence-based campaign reporting." },
                  { icon: LandPlot, title: "Smart Cities & Malls", desc: "Footfall & flow analytics for public spaces." },
                ].map((item, i) => (
                  <div key={i} className="glass p-5 rounded-2xl flex items-start gap-4">
                    <item.icon className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Trinetra */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for the Real World, <span className="text-gradient">Not the Cloud</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Edge AI", desc: "Runs on-site on NVIDIA Jetson GPUs — no constant cloud streaming." },
              { icon: Lock, title: "Privacy-First", desc: "Footage and data never leave your premises." },
              { icon: Zap, title: "Real-Time", desc: "Instant detections and alerts — no delayed cloud batch jobs." },
              { icon: BarChart3, title: "Built to Your Needs", desc: "Not fixed features — we build the analytics your sites require." },
              { icon: Clock, title: "Ready in Days", desc: "Deploy on existing cameras and go live in days, not months." },
              { icon: TrendingUp, title: "Affordable & Scalable", desc: "Effectively low long-term cost that grows board-by-board with you." },
            ].map((item, i) => (
              <motion.div key={i} className="glass p-6 rounded-2xl" {...fadeUp(i * 0.08)}>
                <item.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Contact />
    </main>
    <Footer />
  </div>
);

export default BillboardAnalytics;
