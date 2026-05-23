import ServicePageLayout from "@/components/ServicePageLayout";
import { ScanLine, Database, ShieldCheck, Clock, BarChart3, Settings } from "lucide-react";

const AnprSystem = () => (
  <ServicePageLayout
    seoTitle="ANPR System India | Automatic Number Plate Recognition | Trinetra Systems"
    seoDescription="High-accuracy Automatic Number Plate Recognition (ANPR) system for access control, parking management, toll collection, and law enforcement applications."
    seoKeywords="ANPR system India, automatic number plate recognition, license plate reader, ANPR camera, number plate detection AI, vehicle access control"
    canonicalPath="/anpr-system"
    heroTitle="Automatic Number Plate"
    heroHighlight="Recognition System"
    heroDescription="High-accuracy AI-powered ANPR system that reads vehicle number plates in real-time — for automated access control, parking management, toll collection, and security applications."
    features={[
      { icon: ScanLine, title: "High-Speed Plate Reading", desc: "Read number plates at speeds up to 120 km/h with 98%+ accuracy, even in challenging lighting and weather conditions." },
      { icon: Database, title: "Vehicle Database", desc: "Maintain whitelist/blacklist databases for automated access decisions — allow, deny, or alert based on vehicle registration." },
      { icon: ShieldCheck, title: "Stolen Vehicle Alert", desc: "Cross-reference detected plates against stolen vehicle databases for instant law enforcement alerts." },
      { icon: Clock, title: "Entry/Exit Logging", desc: "Automated timestamp logging of every vehicle entry and exit for complete audit trails and reporting." },
      { icon: BarChart3, title: "Analytics & Reports", desc: "Vehicle frequency analysis, peak hour reports, average dwell time, and historical trend dashboards." },
      { icon: Settings, title: "Barrier Integration", desc: "Direct integration with boom barriers, gates, and parking systems for fully automated access control." },
    ]}
    benefits={[
      "98%+ accuracy on Indian number plates (all state formats)",
      "Works in rain, fog, night, and direct sunlight conditions",
      "Supports whitelist/blacklist for automated access control",
      "Integration with boom barriers and parking management systems",
      "Complete entry/exit logs with searchable vehicle history",
      "On-premise processing — vehicle data stays within your facility",
      "Scalable from single-gate to multi-location enterprise deployment",
    ]}
  />
);

export default AnprSystem;
