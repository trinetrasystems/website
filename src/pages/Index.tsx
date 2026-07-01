import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Solutions from "@/components/Solutions";
import UseCases from "@/components/UseCases";
import SLA from "@/components/SLA";
import WhyChooseUs from "@/components/WhyChooseUs";
import Features from "@/components/Features";
import ResponseTime from "@/components/ResponseTime";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import SeeItInAction from "@/components/SeeItInAction";
import SEOHead from "@/components/SEOHead";
import GlobalReach from "@/components/GlobalReach";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectIfAdminHash = () => {
      if (window.location.hash === "#admin") {
        navigate("/admin", { replace: true });
      }
    };

    redirectIfAdminHash();
    window.addEventListener("hashchange", redirectIfAdminHash);

    return () => {
      window.removeEventListener("hashchange", redirectIfAdminHash);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <main className="pt-16 lg:pt-20">
        <SEOHead
          title="AI Surveillance & Camera Detection Solutions | Smart CCTV Analytics | Trinetra Systems"
          description="Trinetra Systems delivers AI-powered surveillance, smart camera detection, person tracking, and vehicle analytics for societies, industries, and enterprises across all of India — Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune — and internationally, with support in Hindi, Tamil, Telugu, Kannada, Marathi, Bengali and all major Indian languages."
          keywords="AI surveillance solutions, camera detection system, AI camera analytics, smart surveillance, person detection, vehicle detection, society security AI, real-time monitoring, AI-powered CCTV analytics, smart CCTV, AI detection India, Trinetra Systems, AI surveillance company India, AI CCTV company Bangalore, video analytics Bengaluru, AI surveillance Mumbai, AI surveillance Delhi NCR, AI surveillance Hyderabad, AI surveillance Chennai, AI surveillance Pune, AI surveillance Ahmedabad, AI surveillance Kolkata, AI CCTV all states India, AI video analytics company UAE Dubai, AI surveillance Saudi Arabia, video analytics Singapore, AI CCTV software worldwide, multilingual AI surveillance India, AI CCTV support in Hindi, video analytics Tamil, AI surveillance Telugu, AI CCTV Kannada, AI surveillance Marathi, AI surveillance Bengali, AI surveillance Gujarati, AI surveillance Malayalam, AI surveillance Punjabi, regional language CCTV support, AI surveillance all Indian languages"
          canonicalPath="/"
        />
        <Hero />
        <About />
        <Solutions />
        <SeeItInAction />
        <Features />
        <UseCases />
        <ResponseTime />
        <SLA />
        <Pricing />
        <CTA />
        <WhyChooseUs />
        <GlobalReach />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
