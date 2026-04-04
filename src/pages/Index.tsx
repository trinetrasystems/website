import AppSidebar from "@/components/AppSidebar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Solutions from "@/components/Solutions";
import UseCases from "@/components/UseCases";
import SLA from "@/components/SLA";
import Features from "@/components/Features";
import ResponseTime from "@/components/ResponseTime";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 lg:ml-64 mt-16 lg:mt-0">
        <Hero />
        <About />
        <Solutions />
        <UseCases />
        <Features />
        <ResponseTime />
        <SLA />
        <CTA />
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
