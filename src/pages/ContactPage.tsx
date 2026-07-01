import AppSidebar from "@/components/AppSidebar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Contact Trinetra Systems | Book a Free AI Surveillance Demo in India"
        description="Contact Trinetra Systems for AI-powered CCTV surveillance, ANPR, person tracking, and video analytics. Book a free demo, request a quote, or talk to our security experts in India."
        keywords="contact Trinetra Systems, AI surveillance company India, book AI CCTV demo, request surveillance quote, AI video analytics company contact, smart CCTV solutions enquiry, AI security experts India"
        canonicalPath="/contact"
      />
      <AppSidebar />
      <main className="pt-16 lg:pt-20">
        <h1 className="sr-only">
          Contact Trinetra Systems — AI Surveillance, CCTV Analytics &amp; ANPR Company in India
        </h1>
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default ContactPage;
