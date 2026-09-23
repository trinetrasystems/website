import emailjs from "@emailjs/browser";
import { motion, useInView } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import SectionHeader from "./SectionHeader";
import { useRef, useState } from "react";
import { Mail, Phone, MapPin, Send, Share2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { socialLinks } from "@/data/socialLinks";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactFormState = {
  name: string;
  companyName: string;
  email: string;
  contactNumber: string;
  countryCode: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  companyName: "",
  email: "",
  contactNumber: "",
  countryCode: "+91",
  message: "",
};

const countryCodes = [
  { code: "+91", name: "India (IN)" },
  { code: "+1", name: "USA (US)" },
  { code: "+44", name: "UK (GB)" },
  { code: "+61", name: "Australia (AU)" },
  { code: "+971", name: "UAE (AE)" },
  { code: "+65", name: "Singapore (SG)" },
  { code: "+49", name: "Germany (DE)" },
  { code: "+33", name: "France (FR)" },
  { code: "+81", name: "Japan (JP)" },
  { code: "+86", name: "China (CN)" },
  { code: "+7", name: "Russia (RU)" },
  { code: "+55", name: "Brazil (BR)" },
  { code: "+27", name: "South Africa (ZA)" },
  { code: "+31", name: "Netherlands (NL)" },
  { code: "+39", name: "Italy (IT)" },
  { code: "+34", name: "Spain (ES)" },
  { code: "+1", name: "Canada (CA)" },
];

const sanitizePhoneInput = (value: string) => {
  return value.replace(/[^\d\s-]/g, "");
};

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState<ContactFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleInputChange = (field: keyof ContactFormState, value: string) => {
    const nextValue = field === "contactNumber" ? sanitizePhoneInput(value) : value;
    setFormData((previous) => ({ ...previous, [field]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const companyName = formData.companyName.trim();
    const email = formData.email.trim();
    const contactNumber = formData.contactNumber.trim();
    const message = formData.message.trim();

    if (!name || !email || !contactNumber || !message) {
      setStatus({ type: "error", message: "Please fill all form fields." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const fullContactNumber = contactNumber ? `${formData.countryCode} ${contactNumber}` : null;

      await addDoc(collection(db, "publicSubmissions"), {
        name,
        companyName: companyName || null,
        email,
        contactNumber: fullContactNumber,
        message,
        createdAt: serverTimestamp(),
        source: "website-contact",
      });

      // Send email alert via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          company_name: companyName || "N/A",
          from_email: email,
          contact_number: fullContactNumber || "N/A",
          message,
        }
      );

      setFormData(initialFormState);
      setStatus({
        type: "success",
        message: "Your request has been submitted and we will contact you soon.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not submit your message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 md:py-24 px-4 md:px-6 bg-gradient-dark" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Contact"
          inView={isInView}
          title={<>Get in <span className="text-gradient">Touch</span></>}
          description={"Ready to transform your surveillance? Let's talk."}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            {...fadeUp(isInView, 0.2)}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-muted-foreground">contact@trinetrasystems.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-muted-foreground">
                  +91 9924315066
                  <br />
                  +91 9510586183
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visit Us</h3>
                <p className="text-muted-foreground">
                  Trinetra Systems<br />
                  Tech Park, Bengaluru, Karnataka 560001, India
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Follow Us</h3>
                <div className="flex flex-wrap gap-x-6">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            id="contact-form"
            {...fadeUp(isInView, 0.3)}
            className="glass rounded-2xl p-5 sm:p-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <input
                type="text"
                placeholder="Company Name (optional)"
                value={formData.companyName}
                onChange={(event) => handleInputChange("companyName", event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row">
              <div className="w-full shrink-0 md:w-[120px]">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => handleInputChange("countryCode", value)}
                >
                  <SelectTrigger className="h-12 w-full min-w-0 rounded-lg bg-secondary/50 border border-border/50 text-foreground focus:ring-2 focus:ring-primary/50 transition-all">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code + c.name} value={c.code}>
                        {c.code} ({c.name.split(" ")[0]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={formData.contactNumber}
                onChange={(event) => handleInputChange("contactNumber", event.target.value)}
                className="h-12 w-full min-w-0 rounded-lg bg-secondary/50 border border-border/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 md:flex-1"
              />
            </div>

            <textarea
              rows={4}
              placeholder="Tell us your requirement..."
              value={formData.message}
              onChange={(event) => handleInputChange("message", event.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
            {status ? (
              <p
                className={`text-sm ${status.type === "success" ? "text-emerald-400" : "text-red-400"}`}
                role="status"
              >
                {status.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-shine inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary hover:opacity-90 transition-all"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
