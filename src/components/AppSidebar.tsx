import { MouseEvent, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Home, Layers, Grid3X3, Shield, Mail, Lock, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  { title: "Home", href: "#home", icon: Home },
  { title: "Solutions", href: "#solutions", icon: Layers },
  { title: "Use Cases", href: "#usecases", icon: Grid3X3 },
  { title: "SLA", href: "#sla", icon: Shield },
  { title: "Contact", href: "#contact-form", icon: Mail },
];

const AppSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ipLink, setIpLink] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, "users", user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setUserRole(data.role || "user");
            setIpLink(data.ip_link || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserRole(null);
        setIpLink(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleHashNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMobileOpen(false);

    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerElement = document.querySelector("header");
      const headerHeight = headerElement instanceof HTMLElement ? headerElement.offsetHeight : 64;
      const topGradientHeight = 24;
      const extraGap = 12;
      const offset = headerHeight + topGradientHeight + extraGap;
      const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
      window.history.replaceState(null, "", `#${targetId}`);
      return;
    }

    window.location.assign(`/${href}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] header-surface bg-background/95">
        <div className="flex h-16 lg:h-20 w-full items-center justify-between px-3 md:px-5 lg:px-8">
          <a
            href="#home"
            onClick={handleHashNavigation("#home")}
            className="flex items-center gap-2"
          >
            <Eye className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
            <span className="text-base sm:text-lg lg:text-xl font-bold text-primary dark:text-gradient">Trinetra Systems</span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.href.startsWith("#") ? (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={handleHashNavigation(item.href)}
                  className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm lg:text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link
                  key={item.title}
                  to={item.href}
                  className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm lg:text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>{item.title}</span>
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {userRole === "user" && ipLink && (
              <a
                href={ipLink.startsWith("http") ? ipLink : `http://${ipLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex lg:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground animate-pulse-subtle"
                title="Live Dashboard"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live</span>
              </a>
            )}
            
            <ThemeToggle />
            
            <div className="hidden lg:flex items-center gap-2">
              {userRole === "user" && ipLink && (
                <a
                  href={ipLink.startsWith("http") ? ipLink : `http://${ipLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 animate-pulse-subtle"
                >
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Live</span>
                </a>
              )}
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm lg:text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
              >
                <Lock className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Login</span>
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="fixed top-16 lg:top-20 left-0 right-0 z-50 h-6 pointer-events-none bg-gradient-to-b from-background/65 to-transparent dark:from-background/75" />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-[70] lg:hidden header-surface"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  item.href.startsWith("#") ? (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={handleHashNavigation(item.href)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.title}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  )
                ))}
                {userRole === "user" && ipLink && (
                  <a
                    href={ipLink.startsWith("http") ? ipLink : `http://${ipLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Live Dashboard</span>
                  </a>
                )}
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;
