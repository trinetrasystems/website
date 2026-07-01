import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls the window to the top whenever the route (pathname) changes,
// so navigating to a page always starts from the top instead of keeping
// the previous scroll position.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't override in-page anchor navigation (e.g. #contact, #how-it-works).
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
