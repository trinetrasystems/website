import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Car, User, Bell, Shield, Eye, Database, MapPin, Clock, Camera, AlertTriangle, UserX, ShieldAlert, Building2, Lock, Wifi } from "lucide-react";
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

const ResidentialCCTV = () => (
  <div className="min-h-screen">
    <SEOHead
      title="AI CCTV Surveillance for Residential Societies | Society Security | Trinetra Systems"
      description="Trinetra Systems provides AI-powered CCTV surveillance for residential societies — outsider detection, person tracking, delivery monitoring, vehicle ANPR, intrusion prevention, loitering detection, and digital audit trail. Powered by NVIDIA Jetson edge AI."
      keywords="residential CCTV AI surveillance, society security AI, AI camera for society, person tracking residential, delivery tracking CCTV, visitor tracking apartment, vehicle tracking society, ANPR residential gate, loitering detection apartment, smart society security India, gated community security, outsider detection AI, apartment security system India, AI surveillance residential complex, cross-camera person tracking, digital audit trail society, gated community AI CCTV, intrusion detection residential, WhatsApp security alerts society, Trinetra Systems residential"
      canonicalPath="/residential-cctv-ai-surveillance"
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
              AI-Powered Residential Security
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              AI CCTV Surveillance for{" "}
              <span className="text-gradient">Residential Societies</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Complete AI-powered security for gated communities — real-time person tracking, delivery visitor monitoring,
              vehicle ANPR, loitering detection, and a tamper-proof digital audit trail. All processing on-premise via NVIDIA Jetson.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              No cloud dependency. No latency. No manual guard effort. Just intelligent, always-on AI surveillance protecting every resident.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg shadow-2xl hover:shadow-primary/40 transition-all"
              >
                Book a Free Demo <ArrowRight className="w-5 h-5" />
              </motion.a>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-5 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/50 transition-all">
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The <span className="text-gradient">Problem</span> with Traditional Society Security
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Residential societies across India rely on outdated, manual security processes that leave serious gaps.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Database, title: "Paper Visitor Registers", desc: "Manual registers are easily lost, forged, or left incomplete — providing no real accountability or searchable history." },
              { icon: Car, title: "No Vehicle History", desc: "No way to track which vehicles entered, when they arrived, where they parked, or when they exited." },
              { icon: Eye, title: "Incident Investigation Gaps", desc: "Security incidents are nearly impossible to investigate without searchable, timestamped video logs." },
              { icon: Clock, title: "Overstay Risk", desc: "Visitors staying beyond allowed time go unnoticed without automated monitoring and real-time alerts." },
              { icon: Shield, title: "Guard Limitations", desc: "Security guards cannot monitor every camera feed simultaneously — blind spots are inevitable." },
              { icon: AlertTriangle, title: "Delivery Verification Gaps", desc: "No confirmation that deliveries reached the correct apartment or that delivery personnel exited safely." },
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

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">Trinetra Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A real-time AI pipeline running on NVIDIA Jetson edge hardware — no cloud dependency, no latency.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "1", label: "Camera Feed", icon: Camera },
              { step: "2", label: "AI Detection", icon: Eye },
              { step: "3", label: "Person/Vehicle Tracking", icon: User },
              { step: "4", label: "Live Dashboard", icon: Database },
              { step: "5", label: "Real-Time Alert", icon: Bell },
              { step: "6", label: "Audit Trail", icon: Shield },
            ].map((s, i) => (
              <motion.div key={s.step} className="glass rounded-2xl p-4 text-center" {...fadeUp(i * 0.1)}>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-1">Step {s.step}</div>
                <div className="text-sm font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features — merged from society-security */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete <span className="text-gradient">Society Security</span> Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Beyond tracking — Trinetra protects every entry point, monitors every zone, and keeps guards informed in real time.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: UserX, title: "Outsider Detection", desc: "AI automatically identifies unfamiliar faces and unknown persons entering the society premises, triggering instant security alerts before any incident occurs." },
              { icon: ShieldAlert, title: "Intrusion Prevention", desc: "Monitor boundary walls, restricted areas, and emergency exits with AI-powered zone intrusion detection — alerts fire the moment a line is crossed." },
              { icon: Building2, title: "Gate Access Monitoring", desc: "Automated vehicle and pedestrian access logging at society gates with ANPR and person tracking — zero manual entry required." },
              { icon: Wifi, title: "Instant WhatsApp Alerts", desc: "Security guards and society managers receive instant WhatsApp alerts with photos for every suspicious event — no app installation needed." },
              { icon: Eye, title: "24/7 AI Watchguard", desc: "Continuous AI monitoring of all CCTV cameras — never miss an incident, even during guard shift changes or night hours." },
              { icon: Lock, title: "Complete Data Privacy", desc: "All video processing happens on-premise within the society via NVIDIA Jetson — no footage is ever sent to the cloud, ensuring full resident privacy." },
            ].map((f, i) => (
              <motion.div key={f.title} className="glass rounded-2xl p-6 glow-hover transition-all duration-300 group" {...fadeUp(i * 0.08)}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Tracking Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI Vehicle Tracking with <span className="text-gradient">Number Plate Recognition</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Complete entry-to-exit vehicle journey tracking using ANPR (Automatic Number Plate Recognition) — every vehicle logged, verified, and searchable.
            </p>
          </motion.div>

          {/* Vehicle journey images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { img: "/residential/image-5-1.png", step: "01 Entry", title: "LPR Vehicle Entry Detection", desc: "AI reads number plate on arrival with 99%+ accuracy. No manual entry needed by the guard. A unique tracking session begins instantly with timestamp and camera ID." },
              { img: "/residential/image-6-1.png", step: "02 Parking", title: "Parking Verification", desc: "Parking detection is automatically linked to the entry session by license plate. Vehicle type (Sedan/SUV/Bike) and status logged. Unknown vehicles trigger instant security notification." },
              { img: "/residential/image-7-1.png", step: "03 Exit", title: "Exit & Session Close", desc: "Exit detection closes the full session — complete entry-to-exit timeline recorded. Multi-camera verification confirms vehicle identity. Full audit trail searchable anytime." },
            ].map((item, i) => (
              <motion.div key={item.step} className="glass rounded-2xl overflow-hidden glow-hover" {...fadeUp(i * 0.15)}>
                <div className="relative h-48 bg-secondary/20 overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="absolute top-3 left-3 bg-primary px-3 py-1 rounded-full text-white text-xs font-bold">{item.step}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Car, title: "99%+ LPR Accuracy", desc: "TensorRT-optimized ANPR model running on NVIDIA Jetson edge device delivers industry-leading plate reading accuracy." },
              { icon: Shield, title: "Unauthorized Vehicle Alerts", desc: "Unknown or unregistered vehicles trigger immediate real-time security notifications to guards and committee." },
              { icon: Database, title: "Searchable Vehicle Logs", desc: "Every vehicle movement timestamped and fully searchable in the Trinetra dashboard — perfect for incident investigation." },
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

      {/* Person & Delivery Tracking Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI Person Tracking &amp; <span className="text-gradient">Delivery Visitor Monitoring</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Track every delivery person, visitor, and unknown individual across all cameras from entry gate to apartment door — automatically, without any manual guard effort.
            </p>
          </motion.div>

          {/* Delivery journey steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {[
              { step: 1, label: "Entry Gate", img: "/residential/image-9-1.jpeg", desc: "Digital tracking session begins. Badge/appearance captured for cross-camera re-ID." },
              { step: 2, label: "Garden / Lobby", img: "/residential/image-10-1.jpeg", desc: "Movement through garden, parking, and lobby continuously tracked." },
              { step: 3, label: "Apartment Door", img: "/residential/image-11-1.jpeg", desc: "AI confirms visitor reached the correct apartment or floor. Resident notified." },
              { step: 4, label: "Common Areas", img: "/residential/image-12-1.jpeg", desc: "All common area movement (lift, play area, corridors) remains visible to security." },
              { step: 5, label: "Exit", img: "/residential/image-12-2.jpeg", desc: "Visitor exit auto-closes session. Full movement timeline saved to audit log." },
            ].map((s, i) => (
              <motion.div key={s.step} className="glass rounded-2xl overflow-hidden" {...fadeUp(i * 0.1)}>
                <div className="relative h-36 bg-secondary/20">
                  <img src={s.img} alt={s.label} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">{s.step}</div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm mb-1">{s.label}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cross-camera re-id details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div className="glass rounded-2xl p-8" {...fadeUp(0)}>
              <h3 className="text-2xl font-bold mb-6">Cross-Camera Person Re-Identification</h3>
              <div className="space-y-4">
                {[
                  { icon: Camera, title: "No GPS Required", desc: "Person re-identified across multiple camera feeds using AI appearance matching — no wearable or GPS needed." },
                  { icon: MapPin, title: "Zone Monitoring", desc: "Movement through garden, parking, lobby, and lifts all tracked and logged automatically." },
                  { icon: Shield, title: "No Guard Action Needed", desc: "Automated AI monitoring means no reliance on manual observation — guards are notified only when needed." },
                  { icon: Eye, title: "Unauthorized Area Alerts", desc: "Any access to restricted zones triggers instant real-time alerts to security staff." },
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

            <motion.div className="glass rounded-2xl p-8" {...fadeUp(0.15)}>
              <h3 className="text-2xl font-bold mb-6">Delivery Verification System</h3>
              <div className="space-y-4">
                {[
                  { icon: User, title: "Digital Tracking Begins at Entry", desc: "Visitor enters and is assigned a unique AI tracking session. Badge color/ID captured for cross-camera re-identification." },
                  { icon: MapPin, title: "Destination Confirmed", desc: "AI confirms the delivery person reached the correct apartment or floor — not just the building." },
                  { icon: Bell, title: "Resident Push Notification", desc: "Optional mobile push notification sent to the resident the moment their delivery visitor arrives at the door." },
                  { icon: CheckCircle2, title: "Delivery Timestamped", desc: "Delivery completion is timestamped and logged as part of the visit record — full proof of delivery." },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-accent" />
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

      {/* Loitering Detection */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent <span className="text-gradient">Loitering Detection</span> Alerts
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Automatically detect visitors or unknown individuals who overstay beyond the configured time threshold — 
                default 15 minutes, fully customizable per society requirement.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Clock, title: "Configurable Time Threshold", desc: "Alert threshold (default 15 min) customized per your society's specific security requirement." },
                  { icon: Bell, title: "Instant Multi-Channel Notification", desc: "Security guard and committee members receive real-time push alerts the moment a loitering event is detected." },
                  { icon: Eye, title: "Visual Highlight on Dashboard", desc: "Person highlighted in red on the live dashboard view for immediate identification by security staff." },
                  { icon: AlertTriangle, title: "Overstay Audit Log", desc: "Every loitering alert timestamped and stored in the searchable audit trail for future reference." },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{f.title}</div>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="glass rounded-2xl overflow-hidden" {...fadeUp(0.2)}>
              <img src="/residential/image-13-1.png" alt="Loitering detection live alert dashboard" className="w-full h-auto object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-semibold text-sm">⚠ LIVE ALERT TRIGGERED</span>
                </div>
                <p className="text-sm text-muted-foreground">Person detected loitering for more than 15 minutes — security guard notified instantly with visual highlight on dashboard.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Command Center / Dashboard */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trinetra <span className="text-gradient">Live Command Center</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A single unified dashboard giving your security team complete real-time visibility and historical search across all cameras.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Eye, title: "Live View", desc: "Real-time status of all cameras and active sessions across the entire society." },
              { icon: Database, title: "Logs & Audit", desc: "Searchable historical log of all visits and vehicles — find any event in seconds." },
              { icon: User, title: "Visits Tab", desc: "Visitor session tracking with re-entry detection and full movement timeline." },
              { icon: Bell, title: "Alerts Panel", desc: "Active loitering, overstay, and anomaly notifications with one-click details." },
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

          {/* dash-1: Full-width hero — live dashboard with loitering alert banner, stats and chart */}
          <motion.div className="glass rounded-2xl overflow-hidden mb-6 border border-primary/10" {...fadeUp(0.1)}>
            <div className="relative">
              <img
                src="/dashboard_photoes/dash-1.png"
                alt="Trinetra live dashboard — loitering alert, detections today, currently in premises"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live — Loitering Alert Active</span>
                </div>
                <p className="text-sm text-muted-foreground">Real-time dashboard showing detections, active sessions, loitering alerts, and live notifications</p>
              </div>
            </div>
          </motion.div>

          {/* dash-4 + dash-8: Side by side — delivery tracking & audit log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div className="glass rounded-2xl overflow-hidden" {...fadeUp(0.1)}>
              <img
                src="/dashboard_photoes/dash-4.png"
                alt="Trinetra delivery person DELIVERY-REDPASS tracked across cameras — loitering detection"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-border/30">
                <p className="text-xs font-semibold text-primary mb-1">Delivery Visitor Tracking</p>
                <p className="text-xs text-muted-foreground">DELIVERY-REDPASS tracked from entry gate — loitering alert triggered after 15 min threshold</p>
              </div>
            </motion.div>
            <motion.div className="glass rounded-2xl overflow-hidden" {...fadeUp(0.2)}>
              <img
                src="/dashboard_photoes/dash-8.png"
                alt="Trinetra audit log — 7 detections, full notification history with ENTRY, EXIT, SIGHTING events"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-border/30">
                <p className="text-xs font-semibold text-primary mb-1">Digital Audit Trail</p>
                <p className="text-xs text-muted-foreground">Searchable history of all ENTRY, SIGHTING, and EXIT events — timestamped per camera</p>
              </div>
            </motion.div>
          </div>

          {/* dash-9: Full-width real CCTV photo — most impactful */}
          <motion.div className="glass rounded-2xl overflow-hidden" {...fadeUp(0.15)}>
            <img
              src="/dashboard_photoes/dash-9.png"
              alt="Real CCTV footage — delivery person tracked in society garden by Trinetra AI surveillance"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="px-6 py-5 border-t border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">CAM 5 — Garden · 11:28:12</span>
              </div>
              <p className="text-sm text-muted-foreground">Trinetra AI identifies and tracks the delivery person (DELIVERY-REDPASS) across the society garden in real time — no guard input required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Trinetra */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Residential Societies Choose <span className="text-gradient">Trinetra</span>
            </h2>
          </motion.div>
          <div className="glass rounded-[2rem] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Full entry-to-exit vehicle tracking with ANPR — 99%+ accuracy",
                "Cross-camera visitor movement monitoring, end-to-end",
                "Delivery tracking: confirmed at apartment door with resident notification",
                "Re-identification across all cameras without manual guard effort",
                "Configurable loitering detection — real-time alerts to guards",
                "Instant timeline lookup for any person or vehicle",
                "Tamper-proof searchable digital audit trail",
                "Works with your existing CCTV cameras — no replacement needed",
                "On-premise NVIDIA Jetson processing — complete data privacy",
                "Quick 3–5 day deployment with minimal disruption",
                "Affordable per-camera subscription model",
                "24/7 AI monitoring — no dependence on guard attention",
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

      {/* FAQ — SEO rich */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { q: "How does AI person tracking work in a residential society?", a: "Trinetra's AI assigns a unique tracking session to each visitor or delivery person at the entry gate. Using cross-camera re-identification, the system follows the individual across all camera feeds — garden, lobby, lift, corridors — and to their destination apartment, without requiring GPS or any wearable device." },
              { q: "Can Trinetra track delivery persons to the apartment door?", a: "Yes. Trinetra's delivery tracking system confirms when a delivery visitor reaches the correct apartment or floor. An optional push notification is sent to the resident on arrival, and delivery completion is timestamped and logged in the audit trail as proof of delivery." },
              { q: "What is cross-camera person re-identification?", a: "Cross-camera re-ID is an AI technique that matches a person's appearance across multiple camera feeds without GPS or a wearable tag. Trinetra uses this to maintain a continuous tracking session as a visitor moves through different zones of the society — entry gate, garden, parking, lobby, and lift." },
              { q: "How does loitering detection work?", a: "Trinetra's AI monitors how long any individual remains in a zone. If a visitor exceeds the configured time threshold (default 15 minutes, adjustable per society), an instant alert is pushed to the security guard and committee members. The person is highlighted in red on the live dashboard for immediate identification." },
              { q: "Does this system work with existing CCTV cameras?", a: "Yes. Trinetra is designed to integrate with your existing CCTV infrastructure — no camera replacement needed. The AI runs on an NVIDIA Jetson edge device installed on-premise, processing video locally with no cloud dependency and full data privacy." },
              { q: "How quickly can Trinetra be deployed in a residential society?", a: "Typical deployment takes 3–5 working days with minimal disruption to society operations. Our team handles the installation, AI model setup, and guard training." },
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

export default ResidentialCCTV;
