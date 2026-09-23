import Lenis from "lenis";

// Single Lenis instance for the marketing pages. Lenis honours
// prefers-reduced-motion on its own (respectReducedMotion), and
// allowNestedScroll lets menus, dropdowns and drawers scroll natively.
let lenis: Lenis | null = null;

export const startSmoothScroll = () => {
  if (!lenis) {
    lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
  }
  return lenis;
};

export const stopSmoothScroll = () => {
  lenis?.destroy();
  lenis = null;
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The header floats over the page, so land section titles just below it.
const headerOffset = () => {
  const header = document.querySelector("header");
  return (header instanceof HTMLElement ? header.getBoundingClientRect().bottom : 64) + 20;
};

/**
 * Smoothly scrolls to the element with `id`. Returns false if it isn't on this page.
 * `offset` defaults to clearing the floating header; pass 0 to align the element with the top.
 */
export const scrollToSection = (id: string, offset = headerOffset()) => {
  const target = document.getElementById(id);
  if (!target) return false;

  const top = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
  if (lenis) {
    lenis.scrollTo(top);
  } else {
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
  return true;
};

/** Moves to `top` with no animation, keeping the smooth-scroll engine in sync. */
export const jumpTo = (top: number) => {
  if (lenis) {
    lenis.scrollTo(top, { immediate: true, force: true });
  } else {
    window.scrollTo({ top, behavior: "auto" });
  }
};

export const scrollToTop = () => {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo(0, 0);
  }
};
