import { MouseEvent, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, Grid3X3, Star, CircleDollarSign, Mail, Lock, Menu, X, Eye, Shield, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  { title: "Home", href: "#home", icon: Home },
  { title: "Features", href: "#features", icon: Sparkles },
  { title: "Use Cases", href: "#usecases", icon: Grid3X3 },
  { title: "Solutions", href: "/ai-surveillance", icon: Shield, isRoute: true },
  { title: "Workplace", href: "/workplace-analytics", icon: BarChart3, isRoute: true },
  { title: "Blog", href: "/blog", icon: BookOpen, isRoute: true },
  { title: "Pricing", href: "#pricing", icon: CircleDollarSign },
  { title: "Contact", href: "#contact-form", icon: Mail },
];


const AppSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ipLink, setIpLink] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, "users", user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setUserRole(data.role || "user");
            setIpLink(data.ip_link || null);
            setUsername(data.username || data.email || "User");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserRole(null);
        setIpLink(null);
        setUsername(null);
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
      const offset = headerHeight + 20;
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
      <header className="fixed top-0 left-0 right-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="flex h-16 lg:h-20 w-full items-center justify-between px-6 md:px-10 lg:px-16 mx-auto">
          {/* Logo Area */}
          <a
            href="#home"
            onClick={handleHashNavigation("#home")}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
              <Eye className="w-8 h-8 lg:w-10 lg:h-10 text-primary relative z-10 drop-shadow-glow" />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary/80">
              Trinetra Systems
            </span>
          </a>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) =>
              (item as any).isRoute ? (
                <Link
                  key={item.title}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300 group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform text-primary/70 group-hover:text-primary" />
                  <span>{item.title}</span>
                </Link>
              ) : (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={handleHashNavigation(item.href)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300 group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform text-primary/70 group-hover:text-primary" />
                  <span>{item.title}</span>
                </a>
              )
            )}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userRole === "user" && ipLink && (
              <a
                href={ipLink.startsWith("http") ? ipLink : `http://${ipLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black bg-primary text-primary-foreground hover:shadow-glow-primary transition-all animate-pulse-subtle"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Live</span>
              </a>
            )}
            <ThemeToggle />
            <Link
              to="/admin"
              className="hidden sm:flex p-2.5 rounded-xl border border-border/40 hover:bg-secondary/50 transition-all"
              title="Login"
            >
              <Lock className="w-5 h-5 text-muted-foreground" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs z-[70] bg-background border-l border-border/40 p-8 flex flex-col gap-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-black">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-secondary/30">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map((item) =>
                  (item as any).isRoute ? (
                    <Link
                      key={item.title}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={handleHashNavigation(item.href)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </a>
                  )
                )}
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-secondary font-bold"
                >
                  <Lock className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40">
                  <span className="text-sm font-bold text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;
