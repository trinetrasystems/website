import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Timer, HardHat, Flame, ScanLine,
  Eye, Cpu, LayoutDashboard, Bell, ShieldCheck, Camera, BarChart3,
  Gauge, AlertTriangle, ClipboardCheck,
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import SEOHead from "@/components/SEOHead";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const faqs = [
  { q: "How does AI machine uptime monitoring work?", a: "A camera reads whether each machine in frame is actually producing or idle, and starts a clock the moment it stops. Continuous idle duration is tracked per machine, an alert fires once idle time crosses your threshold, and the data rolls up into a shift-wise utilisation report — separating changeover, breakdown and unexplained idling without any manual log." },
  { q: "What does the PPE compliance module check?", a: "Every person on the floor is checked for helmet, vest and goggles, continuously and on every shift. Non-compliance is flagged with a timestamped snapshot, and rules can be set per zone — stricter in a cutting area than at dispatch — giving you audit evidence for buyers, insurers and inspections." },
  { q: "How fast is fire and smoke detection?", a: "Flame and smoke are recognised as visual signatures directly from the camera feed, with detection to phone alert in under 5 seconds. Because it does not wait for smoke to reach a ceiling sensor, it is well suited to large open bays. It complements your existing fire system and does not replace certified detection or suppression equipment." },
  { q: "Can it detect production or print defects in real time?", a: "Yes. A camera over the running material flags ink spots, streaks, hairs, scratches and smudges while the run can still be stopped, marks the defect position, and identifies repeat defects at the same position as a roller or blanket fault. Waste and rework are reported per job and per machine." },
  { q: "Does this work with existing plant CCTV?", a: "Yes. Trinetra runs on your existing IP cameras — no replacement needed. All processing happens locally on AI hardware installed on-premise, so footage never leaves the plant." },
  { q: "Does the fire module replace our certified fire system?", a: "No. The visual fire and smoke module is an early-warning layer that complements your certified detection and suppression equipment — it adds seconds-fast visual alerts on the cameras you already have, but does not replace mandated fire safety systems." },
];

const pageUrl = "https://www.trinetrasystems.com/manufacturing-analytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: "AI Manufacturing Analytics & Safety",
      serviceType: "AI manufacturing video analytics and safety monitoring",
      url: pageUrl,
      description:
        "On-premise AI manufacturing analytics that turns existing plant CCTV into real-time machine uptime monitoring, PPE compliance, visual fire & smoke detection and production defect detection.",
      provider: { "@id": "https://www.trinetrasystems.com/#organization" },
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Singapore" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Manufacturing Analytics Modules",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Machine Uptime & Idle Monitoring" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "PPE Compliance Detection" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire & Smoke Detection" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Production Defect Detection" } },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.trinetrasystems.com/" },
        { "@type": "ListItem", position: 2, name: "Solutions", item: "https://www.trinetrasystems.com/#solutions" },
        { "@type": "ListItem", position: 3, name: "Manufacturing Analytics", item: pageUrl },
      ],
    },
  ],
};

const ManufacturingAnalytics = () => (
  <div className="min-h-screen">
    <SEOHead
      title="AI Manufacturing Analytics & Safety | Machine Uptime, PPE & Fire Detection | Trinetra Systems"
      description="Turn your existing plant CCTV into a real-time safety and productivity system. Trinetra Systems times idle machines to the second, checks PPE compliance continuously, detects fire and smoke visually in seconds, and flags production defects before a run is wasted — all on-premise via dedicated AI hardware."
      keywords="AI manufacturing analytics, machine uptime monitoring CCTV, idle machine detection, PPE compliance detection, helmet vest detection AI, industrial fire and smoke detection, visual flame detection factory, production defect detection AI, print defect detection, factory safety analytics, edge AI manufacturing, on-premise plant video analytics, Trinetra Systems manufacturing"
      canonicalPath="/manufacturing-analytics"
      jsonLd={jsonLd}
    />
    <AppSidebar />
    <main className="pt-16 lg:pt-20">

      {/* Hero */}
      <section className="relative py-20 md:py-36 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
              AI-Powered Manufacturing Safety &amp; Analytics
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              AI Manufacturing Analytics for{" "}
              <span className="text-gradient">Plants &amp; Production Floors</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Downtime, defects and safety lapses are usually found after the fact. Trinetra turns the cameras already covering
              your shop floor into a system that times idle machines to the second, keeps a continuous PPE record, sees fire in
              seconds, and stops a defective run before thousands of parts are wasted.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              Same hardware. Same cameras. Answers that arrive while you can still act on them — all processed on-premise via AI hardware.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
              {["100% On-Premise", "Works With Existing CCTV", "24×7 Monitoring", "Real-Time Alerts"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg shadow-2xl hover:shadow-primary/40 transition-all"
              >
                Book a Free Demo <ArrowRight className="w-5 h-5" />
              </motion.a>
              <a href="#modules" className="inline-flex items-center gap-2 px-8 py-5 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/50 transition-all">
                Explore the Modules
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              On the shop floor, problems are found <span className="text-gradient">after the fact</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Cameras already cover the plant, but they only help once something has gone wrong. These four questions decide
              output, safety and waste — and today none of them are answered in real time.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Timer, title: "Hidden Downtime", desc: "Which press sat idle, for how long, and on whose shift? Idle time is buried in memory, not in a record." },
              { icon: ScanLine, title: "Late-Caught Defects", desc: "A defective run is caught at the end — thousands of sheets or parts late, with the waste already made." },
              { icon: HardHat, title: "Unrecorded PPE Lapses", desc: "PPE is checked by supervision when someone is watching — never as a continuous, timestamped record." },
              { icon: Flame, title: "Slow Fire Response", desc: "Paper, ink and solvent make fire a first-minute problem — but point sensors wait for smoke to reach the ceiling." },
            ].map((item, i) => (
              <motion.div key={item.title} className="glass rounded-2xl p-6 glow-hover transition-all duration-300 group" {...fadeUp(i * 0.08)}>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Module overview */}
      <section id="modules" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Four Plant Modules, <span className="text-gradient">One Dashboard</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each module runs on your existing IP cameras and reports into a single screen — camera health, live alerts, idle machines and PPE at a glance.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { no: "04", icon: Gauge, title: "Machine Uptime & Idle", desc: "Running vs. idle time per machine, per shift." },
              { no: "05", icon: HardHat, title: "PPE Compliance", desc: "Helmet, vest and goggles checks on the floor." },
              { no: "06", icon: Flame, title: "Fire & Smoke Detection", desc: "Visual detection in seconds, pushed to mobile." },
              { no: "07", icon: ScanLine, title: "Production Defects", desc: "Streaks, spots and smudges caught on the line." },
            ].map((m, i) => (
              <motion.div key={m.no} className="glass rounded-2xl p-6 glow-hover transition-all duration-300 group" {...fadeUp(i * 0.1)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <m.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-3xl font-black text-primary/20">{m.no}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 04 — Machine Uptime */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 04 · Plant</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Idle Machines, <span className="text-gradient">Timed to the Second</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                The camera reads whether a machine is actually producing — and starts a clock the moment it stops. You get a
                shift-wise utilisation report without a single manual log, and idle time is separated into changeover, breakdown and unexplained stoppage.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Running or idle status for every machine in frame",
                      "Continuous idle duration, machine by machine",
                      "Alert once idle time crosses your threshold",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Gauge className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Shift-wise utilisation report without a manual log",
                      "Separates changeover, breakdown and unexplained idling",
                      "Idle machine alerts reach the supervisor automatically",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass rounded-xl p-5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Machine 02 · Idle 00:18:47</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supervisor notified automatically. Eighteen minutes of idle time, three times a shift, is a full production hour lost every day.
                </p>
              </div>
            </motion.div>

            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/manufacturing/machine-uptime.jpg" alt="AI machine uptime monitoring — running vs. idle machine detection with idle timer" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 05 — PPE Compliance */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/manufacturing/ppe-compliance.jpg" alt="AI PPE compliance detection — helmet, vest and goggles checks per person on the shop floor" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>

            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 05 · Plant</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Safety Compliance That <span className="text-gradient">Keeps Its Own Record</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every person on the floor is checked for helmet, vest and goggles — continuously, without a supervisor standing
                there. Non-compliance is flagged with a timestamped snapshot, and rules can be stricter in the cutting area than at dispatch.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Helmet, vest and goggles checked per person",
                      "Non-compliance flagged with a timestamped snapshot",
                      "Zone-wise rules — cutting area stricter than dispatch",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><ShieldCheck className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Audit evidence for buyers, insurers and inspections",
                      "Coaching by pattern instead of by confrontation",
                      "Checked on every shift, night included",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { stat: "3 of 4", label: "Operators compliant in this frame" },
                  { stat: "1 flagged", label: "No helmet, no vest — cutting machine" },
                  { stat: "24 × 7", label: "Checked on every shift, night included" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl md:text-2xl font-black text-gradient mb-1">{s.stat}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 06 — Fire & Smoke */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 06 · Plant</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Fire Seen in <span className="text-gradient">Seconds, Not Minutes</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Paper, ink and solvent do not give you a second chance. Visual detection beats point sensors in a large open bay —
                flame and smoke are recognised as visual signatures and a snapshot is pushed to phones with a live-view link.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Flame and smoke detected as visual signatures",
                      "Zone, camera and timestamp attached to the event",
                      "Snapshot pushed to phones with a live-view link",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><AlertTriangle className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "No waiting for smoke to reach a ceiling detector",
                      "Runs on the same cameras already covering the bay",
                      "Detection to phone alert in under 5 seconds",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass rounded-xl p-5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-bold text-sm uppercase tracking-wider">Alert to phone in under 5 seconds</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complements your existing fire system — it does not replace certified detection or suppression equipment.
                </p>
              </div>
            </motion.div>

            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/manufacturing/fire-smoke.jpg" alt="AI fire and smoke detection — visual flame detection with mobile alert on the factory floor" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 07 — Defect Detection */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/manufacturing/print-defect.jpg" alt="AI production defect detection — ink spots, streaks and smudges flagged on the running sheet" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>

            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 07 · Plant</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Defects Caught on the Line, <span className="text-gradient">Not at the End</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                A camera over the running material flags streaks, spots, hairs and smudges while the run can still be stopped.
                Repeat defects at the same position isolate a roller or blanket fault — so you fix the cause, not just the batch.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Ink spots, streaks, hairs, scratches and smudges",
                      "Defect position marked on the sheet",
                      "Repeat defects flagged as a roller or blanket fault",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><ClipboardCheck className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Stop a bad run in minutes, not thousands of parts later",
                      "Waste and rework reported per job, per machine",
                      "Repeat position isolates the faulty unit",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { stat: "6 defects", label: "Flagged in the single frame shown" },
                  { stat: "Per-job log", label: "Every defect stored with an image" },
                  { stat: "Root cause", label: "Repeat position isolates the unit" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <div className="text-lg md:text-xl font-black text-gradient mb-1">{s.stat}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Whole Floor, <span className="text-gradient">in One View</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Camera health, live alerts, idle machines and PPE compliance on a single screen — every event logged with time, camera, location and snapshot.
            </p>
          </motion.div>

          <motion.div className="glass p-2 rounded-2xl mb-6 border border-primary/10" {...fadeUp(0.1)}>
            <img src="/manufacturing/dashboard.jpg" alt="Manufacturing analytics dashboard — live alert tiles, idle-machine panel and alert breakdown by type" className="w-full h-auto rounded-xl" loading="lazy" />
            <p className="text-xs text-muted-foreground text-center py-3">Manufacturing dashboard — live alert tiles, idle-machine panel and alert breakdown by type.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.15)}>
              <img src="/manufacturing/alerts-log.jpg" alt="Manufacturing alert log — searchable, filterable and exportable event history with snapshots" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Full alert log — searchable, filterable and exportable, with a snapshot on every event.</p>
            </motion.div>
            <motion.div className="glass rounded-2xl p-8 flex flex-col justify-center" {...fadeUp(0.2)}>
              <h3 className="text-2xl font-bold mb-6">On the screen</h3>
              <div className="space-y-5">
                {[
                  { icon: Camera, title: "Camera Health & PPE at a Glance", desc: "Every camera's status and current PPE compliance shown on one panel." },
                  { icon: Bell, title: "Alert Tiles With the Trigger Frame", desc: "Fire, idle, PPE and defect alerts each carry the exact frame that raised them." },
                  { icon: Timer, title: "Idle Time Logged Per Machine", desc: "Continuous idle duration per machine, ready for shift-wise utilisation reports." },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{f.title}</div>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div className="mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the <span className="text-gradient">Pieces Fit Together</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Edge AI on your premises — no cloud dependency, no latency, footage never leaves the plant.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "Existing Cameras", desc: "Your IP cameras stream over the local network", icon: Camera },
              { title: "AI Detection", desc: "Tuned models read machines, PPE, fire & defects", icon: Eye },
              { title: "AI Hardware", desc: "On-premise inference — footage stays on site", icon: Cpu },
              { title: "Analytics Engine", desc: "Computes uptime, compliance & defect logs", icon: BarChart3 },
              { title: "Live Dashboard", desc: "Floor-wide reporting with instant alerts", icon: LayoutDashboard },
            ].map((s, i) => (
              <motion.div key={s.title} className="glass rounded-2xl p-5 flex flex-col items-center" {...fadeUp(i * 0.1)}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Manufacturers Choose <span className="text-gradient">Trinetra</span></h2>
          </motion.div>
          <div className="glass rounded-[2rem] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Idle machines timed to the second — shift-wise utilisation without a manual log",
                "Continuous PPE record — audit evidence for buyers, insurers and inspections",
                "Visual fire & smoke detection with a phone alert in under 5 seconds",
                "Production defects flagged before a run is wasted, with per-job logs",
                "One dashboard for camera health, idle machines, PPE and alerts",
                "Every event logged with time, camera, location and snapshot",
                "Works with your existing CCTV — no camera replacement",
                "On-premise AI hardware processing — footage never leaves the plant",
              ].map((b, i) => (
                <motion.div key={i} className="flex items-start gap-3" {...fadeUp(i * 0.05)}>
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-base font-medium">{b}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} className="glass rounded-2xl p-6" {...fadeUp(i * 0.08)}>
                <h3 className="font-bold text-lg mb-3">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </main>
  </div>
);

export default ManufacturingAnalytics;
