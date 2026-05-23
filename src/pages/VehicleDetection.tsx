import ServicePageLayout from "@/components/ServicePageLayout";
import { Car, ScanLine, Route, ParkingCircle, Truck, BarChart3 } from "lucide-react";

const VehicleDetection = () => (
  <ServicePageLayout
    seoTitle="Vehicle Detection & Analytics | AI Traffic Monitoring | Trinetra Systems"
    seoDescription="AI-powered vehicle detection, number plate recognition (ANPR), traffic monitoring, and parking management solutions for smart city and enterprise security."
    seoKeywords="vehicle detection AI, ANPR system India, automatic number plate recognition, traffic monitoring AI, parking management, vehicle analytics"
    canonicalPath="/vehicle-detection"
    heroTitle="AI Vehicle Detection &"
    heroHighlight="Traffic Analytics"
    heroDescription="Intelligent vehicle detection, classification, and tracking powered by AI — from number plate recognition to traffic flow analysis and automated parking management."
    features={[
      { icon: Car, title: "Vehicle Classification", desc: "Automatically detect and classify vehicles by type — cars, trucks, bikes, buses — for traffic analytics and access control." },
      { icon: ScanLine, title: "Number Plate Recognition", desc: "High-accuracy ANPR system that reads license plates in real-time for access control, parking, and law enforcement." },
      { icon: Route, title: "Traffic Flow Analysis", desc: "Monitor traffic density, speed, and flow patterns to optimize road management and detect congestion." },
      { icon: ParkingCircle, title: "Smart Parking Management", desc: "Automated parking occupancy detection and management with entry/exit logging and slot availability tracking." },
      { icon: Truck, title: "Loading Bay Monitoring", desc: "Track vehicle arrivals, loading/unloading times, and bay occupancy for logistics optimization." },
      { icon: BarChart3, title: "Vehicle Analytics Dashboard", desc: "Comprehensive dashboard with vehicle counts, peak hours, dwell times, and historical trend analysis." },
    ]}
    benefits={[
      "Accurate detection in all weather and lighting conditions",
      "High-speed ANPR reading even on moving vehicles",
      "Automated entry/exit logging and access control",
      "Real-time parking availability monitoring",
      "Integration with boom barriers and gate systems",
      "Historical vehicle data and analytics reports",
      "Scalable from single gate to multi-location deployment",
    ]}
  />
);

export default VehicleDetection;
