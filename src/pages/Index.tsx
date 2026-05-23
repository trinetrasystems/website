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
          description="Trinetra Systems provides AI-powered surveillance, smart camera detection, person tracking, vehicle analytics, real-time monitoring, and security solutions for societies, industries, and enterprises in India."
          keywords="AI surveillance solutions, camera detection system, AI camera analytics, smart surveillance, person detection, vehicle detection, society security AI, real-time monitoring, AI-powered CCTV analytics"
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
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
