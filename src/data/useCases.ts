import atmMaskImage from "../../videosandphotoes/ATM_person_with_mask.PNG";
import attendanceImage from "../../videosandphotoes/attendence_monitoring.PNG";
import checkoutImage from "../../videosandphotoes/automatic_billing.PNG";
import productionStuckImage from "../../videosandphotoes/blockage_in_production.PNG";
import objectCountingImage from "../../videosandphotoes/chocolatecounting.PNG";
import fireImage from "../../videosandphotoes/firealert.PNG";
import machineIdleImage from "../../videosandphotoes/machine idle.PNG";
import heatmapImage from "../../videosandphotoes/mart_heatmap.PNG";
import theftImage from "../../videosandphotoes/mart_theft_Detection.PNG";
import fallImage from "../../videosandphotoes/Person_fall_detection.PNG";
import officeMonitoringImage from "../../videosandphotoes/Person_monitoring_office_sleeping_talking.PNG";
import ppeImage from "../../videosandphotoes/person_vest_helmet_goggles.PNG";
import loadingImage from "../../videosandphotoes/smart_loading_unloading.PNG";
import queueImage from "../../videosandphotoes/waiting_queue_person_counting.PNG";
import intrusionImage from "../../videosandphotoes/zoneintrusion.PNG";

export interface UseCaseItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface UseCaseCategory {
  id: string;
  title: string;
  description: string;
  items: UseCaseItem[];
}

export const useCaseCategories: UseCaseCategory[] = [
  {
    id: "safety-ppe-compliance",
    title: "Safety & PPE Compliance",
    description: "Monitor workplace safety gear and detect high-risk incidents in real time.",
    items: [
      {
        id: "industry-ppe",
        title: "Vest, Helmet, Goggles & Seat Belt Compliance",
        description: "Detect PPE usage to enforce safety compliance in industrial zones.",
        image: ppeImage,
      },
      {
        id: "fire-detection",
        title: "Fire Detection",
        description: "Early fire detection alerts for rapid emergency response.",
        image: fireImage,
      },
      {
        id: "fall-detection",
        title: "Person Fall Detection",
        description: "Detect fall incidents instantly to improve safety response time.",
        image: fallImage,
      },
    ],
  },
  {
    id: "security-intrusion-prevention",
    title: "Security & Intrusion Prevention",
    description: "Prevent unauthorized access and suspicious behavior across sensitive environments.",
    items: [
      {
        id: "atm-face-covering",
        title: "ATM Face Covering Alert",
        description: "Trigger alerts when persons with face covering are detected at ATM zones.",
        image: atmMaskImage,
      },
      {
        id: "zone-intrusion",
        title: "Zone Intrusion Detection",
        description: "Detect and alert on unauthorized entry into restricted zones.",
        image: intrusionImage,
      },
      {
        id: "retail-theft-pose",
        title: "Theft Protection with Pose Detection",
        description: "Detect suspicious shoplifting behavior with pose-based analytics.",
        image: theftImage,
      },
    ],
  },
  {
    id: "attendance-presence-management",
    title: "Attendance & Presence Management",
    description: "Automate attendance tracking and workforce presence visibility.",
    items: [
      {
        id: "attendance-system",
        title: "Attendance System",
        description: "Automated attendance monitoring for offices and facilities.",
        image: attendanceImage,
      },
    ],
  },
  {
    id: "workforce-behavior-desk-activity",
    title: "Workforce Behavior & Desk Activity",
    description: "Track desk activity, engagement, and policy adherence in office environments.",
    items: [
      {
        id: "workforce-desk-activity-overview",
        title: "Workforce Monitoring: Mobile, Productivity & Desk Presence",
        description: "Single consolidated office view covering mobile usage, productivity behavior, and desk sitting time insights.",
        image: officeMonitoringImage,
      },
    ],
  },
  {
    id: "process-production-efficiency",
    title: "Process & Production Efficiency",
    description: "Improve throughput and reduce downtime with production intelligence.",
    items: [
      {
        id: "smart-loading-unloading",
        title: "Smart Loading & Unloading",
        description: "Track loading and unloading operations for better logistics control.",
        image: loadingImage,
      },
      {
        id: "machine-idle",
        title: "Machine Idle Detection",
        description: "Identify machine idle periods to reduce operational downtime.",
        image: machineIdleImage,
      },
      {
        id: "object-stuck-production",
        title: "Object Stuck in Production",
        description: "Detect blockages in production lines before they escalate.",
        image: productionStuckImage,
      },
      {
        id: "object-counting",
        title: "Object Counting",
        description: "Count production items in real time for process validation.",
        image: objectCountingImage,
      },
      {
        id: "worker-idle-time",
        title: "Worker Idle Time",
        description: "Monitor idle periods to optimize shift productivity.",
        image: machineIdleImage,
      },
    ],
  },
  {
    id: "queue-checkout-footfall-analytics",
    title: "Queue & Checkout Analytics",
    description: "Optimize customer flow and checkout operations using visual analytics.",
    items: [
      {
        id: "waiting-queue-counting",
        title: "Waiting Queue Person Counting",
        description: "Track queue density and waiting load in real time.",
        image: queueImage,
      },
      {
        id: "realtime-checkout-counter",
        title: "Real-Time Checkout Counter Monitoring",
        description: "Monitor billing conveyor counters for efficient checkout operations.",
        image: checkoutImage,
      },
      {
        id: "retail-heatmap-analytics",
        title: "Retail Heatmap Analytics",
        description: "Visualize busy areas in marts to improve layout and staffing.",
        image: heatmapImage,
      },
    ],
  },
];
