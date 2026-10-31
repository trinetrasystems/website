import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.tsx";
import SmoothScroll from "./components/SmoothScroll.tsx";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";

// Every page except the home page is loaded on demand, so visitors (and the
// customer portal at /admin) only download the code for the page they open.
const Admin = lazy(() => import("./pages/Admin.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PersonDetection = lazy(() => import("./pages/PersonDetection.tsx"));
const VehicleDetection = lazy(() => import("./pages/VehicleDetection.tsx"));
const SocietySecurity = lazy(() => import("./pages/SocietySecurity.tsx"));
const CrossCameraTracking = lazy(() => import("./pages/CrossCameraTracking.tsx"));
const LoiteringDetection = lazy(() => import("./pages/LoiteringDetection.tsx"));
const AnprSystem = lazy(() => import("./pages/AnprSystem.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const ResidentialCCTV = lazy(() => import("./pages/ResidentialCCTV.tsx"));
const WorkplaceAnalytics = lazy(() => import("./pages/WorkplaceAnalytics.tsx"));
const BillboardAnalytics = lazy(() => import("./pages/BillboardAnalytics.tsx"));
const RetailAnalytics = lazy(() => import("./pages/RetailAnalytics.tsx"));
const ManufacturingAnalytics = lazy(() => import("./pages/ManufacturingAnalytics.tsx"));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SmoothScroll />
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* AI Surveillance page removed — redirect the old URL to home to avoid a dead link. */}
            <Route path="/ai-surveillance" element={<Navigate to="/" replace />} />
            <Route path="/person-detection" element={<PersonDetection />} />
            <Route path="/vehicle-detection" element={<VehicleDetection />} />
            <Route path="/society-security" element={<SocietySecurity />} />
            <Route path="/cross-camera-tracking" element={<CrossCameraTracking />} />
            <Route path="/loitering-detection" element={<LoiteringDetection />} />
            <Route path="/anpr-system" element={<AnprSystem />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/residential-cctv-ai-surveillance" element={<ResidentialCCTV />} />
            <Route path="/workplace-analytics" element={<WorkplaceAnalytics />} />
            <Route path="/billboard-analytics" element={<BillboardAnalytics />} />
            <Route path="/retail-analytics" element={<RetailAnalytics />} />
            <Route path="/manufacturing-analytics" element={<ManufacturingAnalytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        <Analytics />
        <SpeedInsights />
        <WhatsAppButton />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
