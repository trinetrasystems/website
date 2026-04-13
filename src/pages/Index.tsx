import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import About from "@/components/About";
import Solutions from "@/components/Solutions";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import FactoryUseCases from "@/components/FactoryUseCases";
import TrustMetrics from "@/components/TrustMetrics";
import WhyChooseUs from "@/components/WhyChooseUs";
import ResponseTime from "@/components/ResponseTime";
import SLA from "@/components/SLA";
import Pricing from "@/components/Pricing";
import CTABanner from "@/components/CTABanner";
import ProofSection from "@/components/ProofSection";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

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
        {/* 1. Hero */}
        <Hero />
        {/* 2. Problem - Why Traditional CCTV Fails */}
        <ProblemSection />
        {/* 3. Solution - AI Monitoring That Works For You */}
        <SolutionSection />
        {/* Existing About - AI-Powered Intelligence */}
        <About />
        {/* Existing Solutions */}
        <Solutions />
        {/* 4. Features - Core Selling Points (updated) */}
        <Features />
        {/* Existing Use Cases carousel */}
        <UseCases />
        {/* 5. Factory Use Cases */}
        <FactoryUseCases />
        {/* 6. Trust / Metrics */}
        <TrustMetrics />
        {/* 7. Why Choose Us */}
        <WhyChooseUs />
        {/* Existing Response Time */}
        <ResponseTime />
        {/* Existing SLA */}
        <SLA />
        {/* 8. Pricing */}
        <Pricing />
        {/* 9. Strong CTA Banner */}
        <CTABanner />
        {/* 10. Proof Section */}
        <ProofSection />
        {/* Existing CTA */}
        <CTA />
        {/* Existing Contact */}
        <Contact />
        {/* Footer with branding tagline */}
        <Footer />
      </main>
    </div>
  );
};

export default Index;
