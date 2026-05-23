import ServicePageLayout from "@/components/ServicePageLayout";
import { Timer, AlertOctagon, MapPinned, TrendingUp, Shield, Cctv } from "lucide-react";

const LoiteringDetection = () => (
  <ServicePageLayout
    seoTitle="AI Loitering Detection | Suspicious Behavior Monitoring | Trinetra Systems"
    seoDescription="Detect loitering, suspicious behavior, and prolonged presence in restricted areas using AI-powered video analytics with real-time alerts."
    seoKeywords="loitering detection AI, suspicious behavior detection, anti-loitering system, AI behavior monitoring, suspicious activity alert India"
    canonicalPath="/loitering-detection"
    heroTitle="AI-Powered"
    heroHighlight="Loitering Detection"
    heroDescription="Automatically detect when individuals linger suspiciously in sensitive areas — ATM zones, building entrances, parking lots, and restricted zones — with configurable time thresholds and instant alerts."
    features={[
      { icon: Timer, title: "Time-Based Detection", desc: "Set custom time thresholds per zone — alert when anyone remains in an area longer than the defined duration." },
      { icon: AlertOctagon, title: "Suspicious Behavior Alerts", desc: "AI detects unusual standing, pacing, or lurking patterns that indicate potential security threats." },
      { icon: MapPinned, title: "Zone-Based Monitoring", desc: "Define multiple detection zones per camera with different sensitivity levels and time thresholds." },
      { icon: TrendingUp, title: "Pattern Analysis", desc: "Identify recurring loitering patterns and hotspots to proactively improve security measures." },
      { icon: Shield, title: "ATM & Bank Security", desc: "Specialized detection for ATM areas — alert when someone with face covering or suspicious behavior is detected." },
      { icon: Cctv, title: "Evidence Recording", desc: "Automatic snapshot and video clip recording of every loitering event for investigation and evidence." },
    ]}
    benefits={[
      "Configurable time thresholds per detection zone",
      "Instant alerts via WhatsApp, SMS, or dashboard",
      "Works 24/7 in all lighting and weather conditions",
      "Reduces security guard workload by 70%+",
      "Pattern analysis for proactive security planning",
      "Automatic evidence recording for every incident",
      "Integration with existing alarm and PA systems",
    ]}
  />
);

export default LoiteringDetection;
