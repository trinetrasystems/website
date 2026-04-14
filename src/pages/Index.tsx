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
