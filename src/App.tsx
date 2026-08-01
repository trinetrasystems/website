import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AiSurveillance from "./pages/AiSurveillance.tsx";
import PersonDetection from "./pages/PersonDetection.tsx";
import VehicleDetection from "./pages/VehicleDetection.tsx";
import SocietySecurity from "./pages/SocietySecurity.tsx";
import CrossCameraTracking from "./pages/CrossCameraTracking.tsx";
import LoiteringDetection from "./pages/LoiteringDetection.tsx";
import AnprSystem from "./pages/AnprSystem.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import ResidentialCCTV from "./pages/ResidentialCCTV.tsx";
import WorkplaceAnalytics from "./pages/WorkplaceAnalytics.tsx";
import BillboardAnalytics from "./pages/BillboardAnalytics.tsx";
import RetailAnalytics from "./pages/RetailAnalytics.tsx";
import ManufacturingAnalytics from "./pages/ManufacturingAnalytics.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/ai-surveillance" element={<AiSurveillance />} />
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
        <Analytics />
        <SpeedInsights />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
