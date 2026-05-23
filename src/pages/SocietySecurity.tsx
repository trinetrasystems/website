import ServicePageLayout from "@/components/ServicePageLayout";
import { Building2, ShieldAlert, UserX, Bell, Eye, Lock } from "lucide-react";

const SocietySecurity = () => (
  <ServicePageLayout
    seoTitle="AI Society Security Solutions | Residential Surveillance | Trinetra Systems"
    seoDescription="AI-powered security solutions for residential societies and gated communities — outsider detection, intrusion prevention, vehicle monitoring, and real-time alerts."
    seoKeywords="society security AI, residential surveillance, gated community security, outsider detection AI, apartment security system India, smart society monitoring"
    canonicalPath="/society-security"
    heroTitle="Smart AI Security for"
    heroHighlight="Residential Societies"
    heroDescription="Keep your residential society safe with AI-powered surveillance — detect outsiders, monitor vehicle access, prevent intrusions, and get instant alerts on your phone."
    features={[
      { icon: UserX, title: "Outsider Detection", desc: "AI automatically identifies unfamiliar faces and unknown persons entering the society premises, triggering instant security alerts." },
      { icon: ShieldAlert, title: "Intrusion Prevention", desc: "Monitor boundary walls, restricted areas, and emergency exits with AI-powered zone intrusion detection." },
      { icon: Building2, title: "Gate Access Monitoring", desc: "Automated vehicle and pedestrian access logging at society gates with ANPR and person tracking." },
      { icon: Bell, title: "Instant WhatsApp Alerts", desc: "Security guards and society managers receive instant WhatsApp alerts with photos for every suspicious event." },
      { icon: Eye, title: "24/7 AI Watchguard", desc: "Continuous AI monitoring of all CCTV cameras — never miss an incident, even during guard shift changes." },
      { icon: Lock, title: "Complete Data Privacy", desc: "All processing happens on-premise within the society — no video data is sent to the cloud, ensuring resident privacy." },
    ]}
    benefits={[
      "Works with existing society CCTV cameras — no replacement needed",
      "Instant WhatsApp alerts to guards and committee members",
      "AI detects outsiders and suspicious activities automatically",
      "Vehicle entry/exit tracking with number plate recognition",
      "Complete data privacy — all processing on-premise",
      "Affordable per-camera subscription model",
      "Quick 3-5 day deployment with minimal disruption",
    ]}
  />
);

export default SocietySecurity;
