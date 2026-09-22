import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startSmoothScroll, stopSmoothScroll } from "@/lib/smoothScroll";

// Smooth (inertial) wheel scrolling on the public site. The admin area keeps
// native scrolling because it is built around tables and scrollable panels.
const SmoothScroll = () => {
  const { pathname } = useLocation();
  const enabled = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    startSmoothScroll();
    return stopSmoothScroll;
  }, [enabled]);

  return null;
};

export default SmoothScroll;
