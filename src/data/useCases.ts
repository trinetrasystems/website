export interface UseCase {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const useCases: UseCase[] = [
  {
    id: "atm-security",
    title: "ATM Security Monitoring",
    description: "AI-powered surveillance for ATM areas detecting suspicious behavior and unauthorized access in real-time.",
    image: "atm-security",
  },
  {
    id: "gold-shop-theft",
    title: "Gold Shop Theft Detection",
    description: "Advanced detection of theft attempts in jewelry stores using behavioral analysis and object tracking.",
    image: "gold-shop-theft",
  },
  {
    id: "retail-theft",
    title: "Retail Theft Detection",
    description: "Pose estimation and object tracking to detect shoplifting behavior like hiding items in pockets.",
    image: "retail-theft",
  },
  {
    id: "helmet-detection",
    title: "Helmet Detection",
    description: "Automatic compliance monitoring for helmet usage on construction sites and industrial zones.",
    image: "helmet-detection",
  },
  {
    id: "safety-vest",
    title: "Safety Vest Detection",
    description: "Real-time detection of high-visibility vest compliance in warehouses and hazardous areas.",
    image: "safety-vest",
  },
  {
    id: "restricted-heatmap",
    title: "Restricted Area Heatmap Alerts",
    description: "Heatmap-based monitoring of restricted zones with instant intrusion alerts.",
    image: "restricted-heatmap",
  },
  {
    id: "loading-verification",
    title: "Smart Loading/Unloading Verification",
    description: "Automated verification of cargo loading and unloading processes at logistics docks.",
    image: "loading-verification",
  },
  {
    id: "intrusion-detection",
    title: "Restricted Zone Intrusion Detection",
    description: "Intent-based detection of unauthorized entry into restricted zones with predictive alerts.",
    image: "intrusion-detection",
  },
  {
    id: "idle-time",
    title: "Worker Idle Time Calculation",
    description: "AI-based tracking of worker activity and productivity with detailed idle time analytics.",
    image: "idle-time",
  },
  {
    id: "fire-detection",
    title: "Fire Detection",
    description: "Early fire and smoke detection using computer vision for rapid emergency response.",
    image: "fire-detection",
  },
  {
    id: "production-stuck",
    title: "Object Stuck in Production",
    description: "Detect jams and stuck objects on production lines to minimize downtime and losses.",
    image: "production-stuck",
  },
  {
    id: "eye-tracking",
    title: "Eye Tracking for Productivity",
    description: "Monitor student attention and engagement using gaze tracking and attention heatmaps.",
    image: "eye-tracking",
  },
  {
    id: "retail-heatmap",
    title: "Retail Heatmap Analytics",
    description: "Customer movement heatmaps for store layout optimization and marketing insights.",
    image: "retail-heatmap",
  },
  {
    id: "checkout-conveyor",
    title: "Real-time Checkout Detection",
    description: "Automated product recognition on conveyor belts for seamless checkout experiences.",
    image: "checkout-conveyor",
  },
  {
    id: "bird-detection",
    title: "Farm Bird Detection & Deterrent",
    description: "Detect birds on crops and trigger automated deterrent systems to protect harvests.",
    image: "bird-detection",
  },
  {
    id: "person-reid",
    title: "Person Re-Identification",
    description: "Track individuals across multiple camera feeds using image-to-video matching.",
    image: "person-reid",
  },
  {
    id: "phone-detection",
    title: "Mobile Phone Usage Detection",
    description: "Detect unauthorized phone usage in workplaces and restricted environments.",
    image: "phone-detection",
  },
  {
    id: "fall-detection",
    title: "Fall Detection",
    description: "Instant detection of falls using pose estimation for elderly care and workplace safety.",
    image: "fall-detection",
  },
  {
    id: "forklift-helmet",
    title: "Forklift Helmet Detection",
    description: "Ensure forklift operators wear helmets with real-time compliance monitoring.",
    image: "forklift-helmet",
  },
  {
    id: "construction-safety",
    title: "Construction PPE Detection",
    description: "Comprehensive PPE detection including goggles, helmets, and safety gear on construction sites.",
    image: "construction-safety",
  },
  {
    id: "crowd-density",
    title: "Crowd Density Monitoring",
    description: "Real-time crowd density analysis for event management and public safety.",
    image: "crowd-density",
  },
  {
    id: "license-plate",
    title: "License Plate Recognition (ANPR)",
    description: "Automatic number plate recognition for parking management, toll systems, and security.",
    image: "license-plate",
  },
];
