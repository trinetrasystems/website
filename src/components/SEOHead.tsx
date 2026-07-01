import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  noindex?: boolean;
}

const SEOHead = ({ title, description, keywords, canonicalPath, noindex }: SEOHeadProps) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    if (keywords) setMeta("keywords", keywords);

    // Robots: mark private/error pages noindex. Managed on every mount so that
    // navigating from a noindex page to an indexable one clears the tag (SPA).
    const robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noindex) {
      if (robotsEl) {
        robotsEl.setAttribute("content", "noindex, nofollow");
      } else {
        const el = document.createElement("meta");
        el.setAttribute("name", "robots");
        el.setAttribute("content", "noindex, nofollow");
        document.head.appendChild(el);
      }
    } else if (robotsEl) {
      robotsEl.remove();
    }

    let canonicalEl = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (canonicalPath) {
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", `https://www.trinetrasystems.com${canonicalPath}`);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, keywords, canonicalPath]);

  return null;
};

export default SEOHead;
