import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <a href="#home" className="inline-flex items-center mb-4">
              {/* Full brand logo — swaps with the theme, same as the header. */}
              <img
                src="/logo/logo-light.png"
                alt="Trinetra Systems"
                className="h-11 sm:h-12 w-auto block dark:hidden"
              />
              <img
                src="/logo/logo-dark.png"
                alt="Trinetra Systems"
                className="h-11 sm:h-12 w-auto hidden dark:block"
              />
            </a>
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
            <h4 className="font-semibold mb-4">Our Solutions</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/person-detection" className="hover:text-foreground transition-colors">Person Detection</a></li>
              <li><a href="/vehicle-detection" className="hover:text-foreground transition-colors">Vehicle Detection</a></li>
              <li><a href="/society-security" className="hover:text-foreground transition-colors">Society Security</a></li>
              <li><a href="/workplace-analytics" className="hover:text-foreground transition-colors">Workplace Analytics</a></li>
              <li><a href="/retail-analytics" className="hover:text-foreground transition-colors">Retail Analytics</a></li>
              <li><a href="/manufacturing-analytics" className="hover:text-foreground transition-colors">Manufacturing Analytics</a></li>
              <li><a href="/anpr-system" className="hover:text-foreground transition-colors">ANPR System</a></li>
              <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@trinetrasystems.com</li>
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

        <div className="border-t border-border/30 pt-8 text-center">
          <p className="text-lg font-semibold text-gradient mb-6">
            Smart AI monitoring. Real-time alerts. Complete data privacy.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trinetra Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
