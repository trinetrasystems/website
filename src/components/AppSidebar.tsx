import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Home, Layers, Grid3X3, Shield, Mail, Lock, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { title: "Home", href: "#home", icon: Home },
  { title: "Solutions", href: "#solutions", icon: Layers },
  { title: "Use Cases", href: "#usecases", icon: Grid3X3 },
  { title: "SLA", href: "#sla", icon: Shield },
  { title: "Contact", href: "#contact", icon: Mail },
];

const AppSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 header-surface">
        <div className="flex h-16 w-full items-center justify-between px-3 md:px-5">
          <a href="#home" className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-gradient">Trinetra Systems</span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.href.startsWith("#") ? (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link
                  key={item.title}
                  to={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden lg:flex">
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
              >
                <Lock className="w-4 h-4" />
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

      <div className="fixed top-16 left-0 right-0 z-40 h-6 pointer-events-none bg-gradient-to-b from-background/65 to-transparent dark:from-background/75" />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-50 lg:hidden header-surface"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  item.href.startsWith("#") ? (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
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
