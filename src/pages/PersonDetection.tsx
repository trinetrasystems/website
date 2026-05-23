import ServicePageLayout from "@/components/ServicePageLayout";
import { Users, UserCheck, Footprints, AlertTriangle, ScanFace, Activity } from "lucide-react";

const PersonDetection = () => (
  <ServicePageLayout
    seoTitle="AI Person Detection & Tracking | People Counting | Trinetra Systems"
    seoDescription="Advanced AI-powered person detection, people counting, fall detection, and person tracking solutions for security, retail, and industrial applications."
    seoKeywords="person detection AI, people counting, AI person tracking, fall detection, person re-identification, crowd detection India"
    canonicalPath="/person-detection"
    heroTitle="AI Person Detection &"
    heroHighlight="Tracking Solutions"
    heroDescription="Detect, count, and track people across multiple cameras with advanced AI — from fall detection and crowd monitoring to person re-identification and attendance tracking."
    features={[
      { icon: Users, title: "People Counting", desc: "Accurate real-time people counting for retail footfall analytics, queue management, and crowd density monitoring." },
      { icon: UserCheck, title: "Person Re-Identification", desc: "Track individuals across multiple cameras without facial recognition — using AI-based appearance matching for privacy-compliant tracking." },
      { icon: Footprints, title: "Fall Detection", desc: "Instant detection of person falls in hospitals, factories, and elderly care facilities with immediate alert notifications." },
      { icon: AlertTriangle, title: "Intrusion Detection", desc: "Detect unauthorized persons entering restricted zones with instant alerts and evidence recording." },
      { icon: ScanFace, title: "Attendance Monitoring", desc: "Automated attendance tracking using AI-powered person detection — no biometric hardware needed." },
      { icon: Activity, title: "Behavior Analysis", desc: "Monitor suspicious behavior patterns, loitering, and unusual activities with intelligent AI analytics." },
    ]}
    benefits={[
      "Detect and track people across multiple cameras seamlessly",
      "Privacy-compliant tracking without facial recognition",
      "Real-time fall detection with sub-second alert time",
      "Automated attendance and headcount monitoring",
      "Works in all lighting conditions including night vision cameras",
      "Customizable detection zones and rules per camera",
      "Integration with existing access control systems",
    ]}
  />
);

export default PersonDetection;
