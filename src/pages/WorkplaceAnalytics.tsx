import { motion } from "framer-motion";
import { 
  Building2, Users, Coffee, CheckCircle2, 
  Monitor, LayoutDashboard, Clock, Eye, Shield, BarChart3,
  Cpu, HardDrive, Network
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import SEOHead from "@/components/SEOHead";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay },
});

const WorkplaceAnalytics = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="AI Workplace Analytics | Employee Productivity & Space Utilization | Trinetra Systems"
      description="Transform CCTV infrastructure into actionable workplace intelligence. Get comprehensive cafeteria and meeting room utilization solutions for offices, along with advanced employee productivity monitoring."
      keywords="workplace employee productivity monitoring, cafeteria utilization solutions for offices, meeting room utilization solutions for offices, desk occupancy tracking, office space optimization AI, edge AI workplace intelligence, Trinetra Systems workplace analytics"
      canonicalPath="/workplace-analytics"
    />
    <AppSidebar />

    <main className="pt-24 lg:pt-32">
      {/* Hero Section */}
      <section className="px-4 md:px-6 mb-16 md:mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Enterprise Workplace Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                AI-Powered <span className="text-gradient">Workplace Analytics</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Transform your existing CCTV infrastructure into actionable workplace intelligence. Monitor space utilization, occupancy, and employee productivity with 100% on-premise privacy. Delivering comprehensive cafeteria and meeting room utilization solutions for offices.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
                {[
                  "100% On-Premise",
                  "No Cloud Dependency",
                  "Privacy by Design",
                  "Real-Time Analytics"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <a href="#contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-glow-primary transition-all">
                Get a Free Demo
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              You pay for space you can't <span className="text-gradient">actually measure</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              30–40% of corporate real estate typically sits under-utilized at any given hour. Every unmeasured square foot is a hidden cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.1)}>
              <Monitor className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Inefficient Desk Usage</h3>
              <p className="text-muted-foreground">Hybrid work leaves large floor areas under-occupied and over-leased. Employee productivity monitoring is hard to measure manually.</p>
            </motion.div>
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.2)}>
              <Users className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Meeting Rooms Sit Idle</h3>
              <p className="text-muted-foreground">Rooms are blocked on calendars but empty in reality — capacity is wasted.</p>
            </motion.div>
            <motion.div className="glass p-6 rounded-2xl" {...fadeUp(0.3)}>
              <Coffee className="w-10 h-10 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Cafeteria Insight</h3>
              <p className="text-muted-foreground">Peak-hour crowding and off-peak emptiness go unmeasured, leading to poor facility management.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Desk Analytics */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-gradient">Desk Occupancy</span> & Utilization
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Monitor real-time desk occupancy, identify productive desk time for comprehensive employee productivity monitoring, and detect idle seats across your organization.
              </p>
              <ul className="space-y-4">
                {[
                  "Live desk occupancy tracking and mapping",
                  "Productive desk time vs idle desk detection",
                  "Peak occupancy hours and floor-wise utilization",
                  "Comprehensive utilization rate analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/workplace/image18.png" alt="AI employee productivity monitoring and live desk occupancy detection" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
          <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.3)}>
            <img src="/workplace/image25.png" alt="Workplace analytics dashboard showing desk utilization and employee productivity metrics" className="w-full h-auto rounded-xl" />
          </motion.div>
        </div>
      </section>

      {/* Meeting Room Analytics */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div className="order-2 lg:order-1 glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/workplace/image35.png" alt="Live meeting room utilization solutions tracking for office spaces" className="w-full h-auto rounded-xl" />
            </motion.div>
            <motion.div className="order-1 lg:order-2" {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-gradient">Meeting Room</span> Utilization
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Compare booked time versus actual usage. Identify ghost meetings and optimize your collaborative spaces based on real data using our advanced meeting room utilization solutions for offices.
              </p>
              <ul className="space-y-4">
                {[
                  "Live room occupancy detection and attendee count",
                  "Peak meeting hours identification",
                  "Utilization % (Booked time vs actual usage)",
                  "Insights into most and least utilized rooms"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.3)}>
            <img src="/workplace/image40.png" alt="Meeting room utilization solutions dashboard for corporate offices" className="w-full h-auto rounded-xl" />
          </motion.div>
        </div>
      </section>

      {/* Cafeteria Analytics */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div {...fadeUp()}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="text-gradient">Cafeteria</span> Analytics
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Understand the lunch rush. Optimize catering, cleaning, and seating arrangements with accurate footfall and occupancy data.
              </p>
              <ul className="space-y-4">
                {[
                  "Live table occupancy and available seat counting",
                  "Peak occupancy analysis and busiest moments",
                  "Average visit duration and dwell time",
                  "Daily total footfall through the space"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.2)}>
              <img src="/workplace/image42.png" alt="AI-powered cafeteria occupancy and utilization analytics for offices" className="w-full h-auto rounded-xl" />
            </motion.div>
          </div>
          <motion.div className="glass p-2 rounded-2xl" {...fadeUp(0.3)}>
            <img src="/workplace/image45.png" alt="Cafeteria utilization solutions dashboard showing peak hours and occupancy" className="w-full h-auto rounded-xl" />
          </motion.div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div mb-12 {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How The <span className="text-gradient">Pieces Fit Together</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
              Our edge AI deployment ensures anonymous analytics and on-premise data processing — privacy compliance is built right in.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2 z-0" />
            
            {[
              { title: "CCTV Cameras", desc: "Existing IP cameras stream over local network", icon: Eye },
              { title: "YOLO Detection", desc: "Tuned model identifies people & seats", icon: Scan },
              { title: "Jetson Orin Nano", desc: "On-premise edge inference", icon: Cpu },
              { title: "Analytics Engine", desc: "Computes utilization metrics", icon: BarChart3 },
              { title: "Dashboards", desc: "Live reporting for HR & Facilities", icon: LayoutDashboard }
            ].map((step, i) => (
              <motion.div key={i} className="relative z-10 flex flex-col items-center group" {...fadeUp(i * 0.1)}>
                <div className="w-16 h-16 rounded-2xl bg-background border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(var(--primary),0.2)] group-hover:scale-110 transition-transform">
                  {step.title === "YOLO Detection" ? (
                    <Scan className="w-8 h-8 text-primary" />
                  ) : (
                    <step.icon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      <Contact />
    </main>
    <Footer />
  </div>
);

// Fallback icon if Scan is not imported correctly above
function Scan(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}

export default WorkplaceAnalytics;
