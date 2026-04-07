import AppSidebar from "@/components/AppSidebar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <main className="pt-16">
        <Contact />
        <Footer />
      </main>
    </div>
  );
};

export default ContactPage;
