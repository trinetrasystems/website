import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ContactFormState = {
  name: string;
  email: string;
  contactNumber: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  contactNumber: "",
  message: "",
};

const sanitizePhoneInput = (value: string) => {
  const allowedChars = value.replace(/[^\d+\s()-]/g, "");
  const hasLeadingPlus = allowedChars.startsWith("+");
  const withoutExtraPlus = hasLeadingPlus
    ? `+${allowedChars.slice(1).replace(/\+/g, "")}`
    : allowedChars.replace(/\+/g, "");

  return withoutExtraPlus;
};

const normalizePhoneForStorage = (value: string) => {
  const compact = value.replace(/[\s()-]/g, "");
  const withCountryPrefix = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;

  return withCountryPrefix;
};

const isValidInternationalPhone = (value: string) => /^\+[1-9]\d{7,14}$/.test(value);

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
    const email = formData.email.trim();
    const rawContactNumber = formData.contactNumber.trim();
    const contactNumber = normalizePhoneForStorage(rawContactNumber);
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setStatus({ type: "error", message: "Please fill all form fields." });
      return;
    }

    if (contactNumber && !isValidInternationalPhone(contactNumber)) {
      setStatus({
        type: "error",
        message: "Enter contact number with country code, for example +91 XXXXXXXXXX.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const documentRef = await addDoc(collection(db, "publicSubmissions"), {
        name,
        email,
        contactNumber: contactNumber || null,
        message,
        createdAt: serverTimestamp(),
        source: "website-contact",
      });

      setFormData(initialFormState);
      setStatus({
        type: "success",
        message: `Message sent successfully. ID: ${documentRef.id}`,
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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ready to transform your surveillance? Let's talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-muted-foreground">contact@trinetra.ai</p>
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
                  Trinetra AI Technologies Pvt. Ltd.<br />
                  Tech Park, Bengaluru, Karnataka 560001, India
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-2xl p-8 space-y-6"
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
            </div>
            <input
              type="tel"
              placeholder="+91 XXXXXXXXXX (optional)"
              value={formData.contactNumber}
              onChange={(event) => handleInputChange("contactNumber", event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              title="Optional. If provided, use international format with country code, e.g. +91 XXXXXXXXXX"
              className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <p className="-mt-3 text-xs text-muted-foreground">
              Optional. Include country code if entered. Example: +91 XXXXXXXXXX
            </p>
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary hover:opacity-90 transition-all"
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
