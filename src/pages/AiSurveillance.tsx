import ServicePageLayout from "@/components/ServicePageLayout";
import { Camera, Brain, Shield, Zap, LayoutDashboard, Bell } from "lucide-react";

const AiSurveillance = () => (
  <ServicePageLayout
    seoTitle="AI Surveillance Solutions | Smart CCTV Analytics | Trinetra Systems"
    seoDescription="Transform your existing CCTV into an intelligent AI surveillance system. Real-time detection, instant alerts, and on-premise processing for complete data privacy."
    seoKeywords="AI surveillance solutions, smart surveillance, AI camera analytics, intelligent CCTV, AI-powered surveillance system, real-time surveillance India"
    canonicalPath="/ai-surveillance"
    heroTitle="AI-Powered"
    heroHighlight="Surveillance Solutions"
    heroDescription="Transform your existing CCTV cameras into an intelligent AI surveillance system that monitors, detects, and alerts in real time — all processed on your premises for complete data privacy."
    features={[
      { icon: Camera, title: "Smart Camera Analytics", desc: "AI-powered video analytics that turn ordinary CCTV cameras into intelligent monitoring systems with real-time detection capabilities." },
      { icon: Brain, title: "Edge AI Processing", desc: "All AI processing happens on-premise using edge computing — your video data never leaves your facility, ensuring complete privacy." },
      { icon: Shield, title: "24/7 Automated Monitoring", desc: "Continuous AI surveillance that never sleeps, never gets distracted — monitoring every camera feed around the clock." },
      { icon: Zap, title: "Instant Alert System", desc: "Get real-time alerts via WhatsApp, email, or dashboard within seconds of any detection event." },
      { icon: LayoutDashboard, title: "Centralized Dashboard", desc: "Monitor all cameras, events, and analytics from a single unified dashboard with historical data and reports." },
      { icon: Bell, title: "Custom Detection Rules", desc: "Define custom AI detection rules for any scenario — intrusion, fire, PPE compliance, crowd density, and more." },
    ]}
    benefits={[
      "Works with your existing CCTV infrastructure — no hardware replacement needed",
      "On-premise processing ensures 100% data privacy and security",
      "Real-time alerts with less than 1 second latency",
      "95%+ detection accuracy with AI models trained for Indian conditions",
      "Rapid deployment in just 3-5 days",
      "Affordable monthly subscription model with no hidden costs",
      "Dedicated support team with guaranteed SLA response times",
    ]}
  />
);

export default AiSurveillance;
