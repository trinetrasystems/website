import ServicePageLayout from "@/components/ServicePageLayout";
import { Radar, Link2, MapPin, Clock, Fingerprint, Network } from "lucide-react";

const CrossCameraTracking = () => (
  <ServicePageLayout
    seoTitle="Cross Camera Person Tracking | AI Re-Identification | Trinetra Systems"
    seoDescription="Track individuals seamlessly across multiple cameras using AI-powered person re-identification — without facial recognition for complete privacy compliance."
    seoKeywords="cross camera tracking, person re-identification, multi-camera tracking AI, cross camera person tracking India, AI person tracking, appearance-based tracking"
    canonicalPath="/cross-camera-tracking"
    heroTitle="Cross Camera"
    heroHighlight="Person Tracking"
    heroDescription="Seamlessly track individuals as they move across multiple cameras using AI-powered appearance matching — no facial recognition required, ensuring complete privacy compliance."
    features={[
      { icon: Radar, title: "Multi-Camera Tracking", desc: "Track a person's journey across unlimited cameras in real-time using AI-based appearance re-identification." },
      { icon: Link2, title: "Appearance Matching", desc: "Advanced AI matches people by clothing, body shape, and gait patterns — no facial recognition needed for privacy compliance." },
      { icon: MapPin, title: "Location Trail", desc: "Generate complete movement trails showing where a person was seen, when, and for how long across your facility." },
      { icon: Clock, title: "Historical Search", desc: "Search through historical footage to find and track a specific person across all cameras using a single reference image." },
      { icon: Fingerprint, title: "Privacy Compliant", desc: "No biometric data is stored or processed — tracking uses visual appearance features that cannot be used to identify individuals." },
      { icon: Network, title: "Scalable Architecture", desc: "Works across dozens to hundreds of cameras with edge processing for minimal network load." },
    ]}
    benefits={[
      "Track persons across unlimited cameras without facial recognition",
      "Privacy-compliant AI that doesn't store biometric data",
      "Real-time tracking with sub-second re-identification speed",
      "Historical search to trace any person's complete movement trail",
      "Works with existing CCTV infrastructure — no camera changes needed",
      "Ideal for malls, airports, hospitals, campuses, and large facilities",
      "On-premise processing ensures video data never leaves your premises",
    ]}
  />
);

export default CrossCameraTracking;
