import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Users, Clock, Bell,
  LineChart, Layers, Store, Eye, Cpu, LayoutDashboard, TrendingUp,
  Thermometer, BarChart3, Camera,
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

const RetailAnalytics = () => (
  <div className="min-h-screen">
    <SEOHead
      title="AI Retail Analytics | Footfall, Conversion & Shelf Heatmaps | Trinetra Systems"
      description="Turn your existing store CCTV into a real-time retail intelligence system. Trinetra Systems measures footfall vs. billing conversion, raises live billing-queue alerts, and maps shelf dwell heatmaps — all processed on-premise via NVIDIA Jetson edge AI."
      keywords="AI retail analytics, retail footfall counting, conversion rate CCTV, people counting store, billing queue detection, checkout queue alerts, shelf dwell time heatmap, aisle heatmap analytics, retail store intelligence, edge AI retail, on-premise retail video analytics, Trinetra Systems retail analytics"
      canonicalPath="/retail-analytics"
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
              AI-Powered Retail Store Intelligence
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              AI Retail Analytics for{" "}
              <span className="text-gradient">Stores &amp; Retail Chains</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              You can count sales. You cannot count the sales you missed. Trinetra turns the cameras you already own into a
              real-time system that counts every walk-in, matches it against billing, watches the checkout queue, and maps
              where attention actually goes on your floor.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              Same hardware. Same cameras. Answers that arrive while you can still act on them — all processed on-premise via NVIDIA Jetson.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
              {["100% On-Premise", "Works With Existing CCTV", "Real-Time Alerts", "Privacy by Design"].map((f) => (
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

      {/* The Opportunity / Problem */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your CCTV is used to <span className="text-gradient">look back</span>. AI makes it act in real time.
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Most stores already run cameras — but only to review footage after something happened. These are the questions
              that go unanswered every single day, and each one is money left on the floor.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Missed Walk-Ins", desc: "How many people walked in but never billed? You count sales — but never the visitors who left without buying." },
              { icon: Thermometer, title: "Dead Aisle Space", desc: "Which aisles hold attention, and which are dead space? Merchandising decisions are made on guesswork, not evidence." },
              { icon: Clock, title: "Silent Queue Loss", desc: "How long did the billing queue run before anyone noticed? Customers abandon the line and you never find out." },
              { icon: TrendingUp, title: "Unknown Peak Hours", desc: "When exactly are the peak hours, store by store? Staff rosters are built on assumptions, not real traffic." },
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

      {/* What we deploy — module overview */}
      <section id="modules" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Retail Modules, <span className="text-gradient">One Dashboard</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each module runs on your existing IP cameras and reports into a single screen — for store staff and head office alike.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { no: "01", icon: LineChart, title: "Footfall & Conversion", desc: "People in vs. people billed, hour by hour." },
              { no: "02", icon: Bell, title: "Billing-Queue Alerts", desc: "Live queue length with open-a-counter alerts." },
              { no: "03", icon: Layers, title: "Shelf Dwell Heatmaps", desc: "Where customers stop, aisle by aisle." },
            ].map((m, i) => (
              <motion.div key={m.no} className="glass rounded-2xl p-8 glow-hover transition-all duration-300 group" {...fadeUp(i * 0.1)}>
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

      {/* Module 01 — Footfall & Conversion */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 01 · Retail</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Footfall &amp; Conversion, <span className="text-gradient">Counted Automatically</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                A single entry camera turns walk-ins into a number you can manage. Every person crossing the line is counted,
                then matched against billing to compute your true conversion rate — live, without a single manual count.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Every person crossing the IN and OUT line, counted separately",
                      "Billing events matched against entries in the same window",
                      "Entered vs. billed plotted through the day",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><TrendingUp className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Judge promotions and displays on real traffic, not guesswork",
                      "Roster staff against the real peak, not the assumed one",
                      "Spot the gap between visitors and buyers instantly",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { stat: "28 / 16", label: "Entered vs. billed in the window" },
                  { stat: "57.14%", label: "Conversion rate, computed live" },
                  { stat: "11 AM–1 PM", label: "Detected peak-hour band" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl md:text-2xl font-black text-gradient mb-1">{s.stat}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/retail/footfall-conversion.jpg" alt="AI footfall and conversion analytics — people counting with IN/OUT lines and live conversion rate" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 02 — Billing Queue */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/retail/billing-queue.jpg" alt="AI billing-queue detection — live queue length with open-another-counter alert" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>

            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 02 · Retail</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Nobody Leaves Because the <span className="text-gradient">Queue Got Long</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                The system watches your billing counters and raises an alert before customers abandon the line. A second counter
                opens on evidence — a live queue count — not on a complaint that comes too late.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Queue length at each counter, updated continuously",
                      "Which counters are open and which are closed",
                      "How long the queue has been over its threshold",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><TrendingUp className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "A second counter opens on evidence, not on a complaint",
                      "Queue history exposes the hours that need a floater",
                      "Fewer abandoned baskets at peak hours",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass rounded-xl p-5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Alert · 6 people in queue</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Status: over capacity → open another counter. Alerts reach the store manager&apos;s phone and the counter display at the same moment.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 03 — Shelf Heatmaps */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Module 03 · Retail</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">
                Which Aisle <span className="text-gradient">Earns Its Shelf Space</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Dwell-time heatmaps show where attention actually goes — the input every merchandising decision needs. Put
                high-margin and new products where people already stop, and move slow stock off prime shelf.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><Eye className="w-5 h-5 text-primary" /> What the system sees</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Average dwell time and footfall for every aisle",
                      "Heat overlay of standing time across the floor",
                      "Ranking of aisles from strongest to weakest",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-bold mb-3"><TrendingUp className="w-5 h-5 text-accent" /> Why it matters</h4>
                  <ul className="space-y-2.5">
                    {[
                      "Put high-margin and new products where people already stop",
                      "Move slow stock off prime shelf and re-test next month",
                      "Validate planograms against real customer behaviour",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { stat: "42s", label: "Top dwell — best-margin slot" },
                  { stat: "25s", label: "Lowest dwell — low priority" },
                  { stat: "59.43%", label: "Store conversion for the period" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl md:text-2xl font-black text-gradient mb-1">{s.stat}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/retail/shelf-heatmap.jpg" alt="AI shelf dwell-time heatmap — aisle-wise footfall and engagement overlay" className="w-full h-auto rounded-xl" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center py-3">Representative visualisation of Trinetra&apos;s detection output.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard — every branch on one screen */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Every Branch on <span className="text-gradient">One Screen</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Store staff see today. Head office sees every branch on the same metrics, side by side — with a full alert log that is searchable, filterable and exportable.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Store, title: "Branch Selector", desc: "Switch between any store, or compare all branches on identical footfall, queue and conversion metrics." },
              { icon: LayoutDashboard, title: "Live View & Charts", desc: "Real-time store view, footfall trend, and queue & counter utilisation — all on a single, live dashboard." },
              { icon: Bell, title: "Alerts with Snapshots", desc: "Every alert logged with severity and a trigger snapshot — searchable, filterable and exportable." },
            ].map((f, i) => (
              <motion.div key={f.title} className="glass rounded-2xl p-6 text-center" {...fadeUp(i * 0.1)}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div className="mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the <span className="text-gradient">Pieces Fit Together</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Edge AI on your premises — anonymous analytics, no cloud dependency, privacy built in.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "Existing Cameras", desc: "Your IP cameras stream over the local network", icon: Camera },
              { title: "AI Detection", desc: "Tuned model counts people, queues & dwell", icon: Eye },
              { title: "Jetson Edge", desc: "On-premise inference — no footage leaves site", icon: Cpu },
              { title: "Analytics Engine", desc: "Computes footfall, conversion & heatmaps", icon: BarChart3 },
              { title: "Live Dashboard", desc: "Store & head-office reporting with alerts", icon: LayoutDashboard },
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
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Retailers Choose <span className="text-gradient">Trinetra</span></h2>
          </motion.div>
          <div className="glass rounded-[2rem] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Footfall and conversion counted automatically — no manual tally",
                "Live billing-queue alerts before customers abandon the line",
                "Shelf dwell heatmaps that turn merchandising into evidence",
                "Every branch compared on one head-office dashboard",
                "Searchable, exportable alert log with trigger snapshots",
                "Works with your existing CCTV — no camera replacement",
                "On-premise NVIDIA Jetson processing — complete data privacy",
                "Anonymous analytics — counts and heatmaps, not identities",
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
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { q: "How does AI footfall and conversion counting work?", a: "A single entry camera counts every person crossing the IN and OUT line. Billing events are matched against entries in the same time window to compute a live conversion rate — the share of visitors who actually purchased. Everything is plotted through the day so you can see visitors, buyers and peak hours at a glance." },
              { q: "Does the billing-queue alert work in real time?", a: "Yes. The system continuously measures queue length at each counter and how long it has stayed over its threshold. When the queue exceeds capacity, an alert reaches the store manager's phone and the counter display at the same moment — so a second counter opens on evidence, not on a complaint." },
              { q: "What is a shelf dwell heatmap?", a: "It is a visual overlay of how long customers stand in front of each aisle, combined with footfall per aisle. Aisles are ranked from strongest to weakest engagement, so you can place high-margin and new products where attention already goes and move slow stock off prime shelf." },
              { q: "Does this work with our existing CCTV cameras?", a: "Yes. Trinetra runs on your existing IP cameras — no replacement needed. The AI processes video locally on an NVIDIA Jetson edge device installed on-premise, so no footage is sent to the cloud." },
              { q: "Is customer privacy protected?", a: "Yes. The analytics are anonymous — the system produces counts, queue lengths and heatmaps, not personal identities. All processing happens on-premise, keeping footage inside your store network." },
              { q: "Can head office see all branches together?", a: "Yes. Store staff see their own live view, while head office sees every branch on the same footfall, queue and conversion metrics, side by side, with a searchable and exportable alert log." },
            ].map((faq, i) => (
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

export default RetailAnalytics;
