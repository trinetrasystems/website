import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Home, Layers, Grid3X3, Shield, Mail, Lock, Menu, X } from "lucide-react";

const navItems = [
  { title: "Home", href: "#home", icon: Home },
  { title: "Solutions", href: "#solutions", icon: Layers },
  { title: "Use Cases", href: "#usecases", icon: Grid3X3 },
  { title: "SLA", href: "#sla", icon: Shield },
  { title: "Contact", href: "#contact", icon: Mail },
];

const AppSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <a href="#home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-gradient">Trinetra</span>
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.title}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 group"
          >
            <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">{item.title}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <a
          href="#admin"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 group"
        >
          <Lock className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Admin Login</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 z-40 flex-col glass-strong border-r border-border/30">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-16">
          <a href="#home" className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-gradient">Trinetra</span>
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
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
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden glass-strong border-r border-border/30"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppSidebar;
