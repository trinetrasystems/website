import { Eye, Github, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-gradient">Trinetra Systems</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered smart surveillance platform delivering real-time video analytics for security, safety, and automation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#home" className="hover:text-foreground transition-colors">Home</a></li>
              <li><a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a></li>
              <li><a href="#usecases" className="hover:text-foreground transition-colors">Use Cases</a></li>
              <li><a href="#sla" className="hover:text-foreground transition-colors">SLA</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>trinetrasystems.com.gmail.com</li>
              <li>+91 9924315066</li>
              <li>Tech Park, Bengaluru, Karnataka<br />560001, India</li>
            </ul>
            <div className="flex gap-3 mt-4">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Trinetra Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
