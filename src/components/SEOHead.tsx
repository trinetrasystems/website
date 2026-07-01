import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  noindex?: boolean;
  // Optional page-specific JSON-LD structured data (e.g. BlogPosting).
  jsonLd?: Record<string, unknown>;
}

const SEOHead = ({ title, description, keywords, canonicalPath, noindex, jsonLd }: SEOHeadProps) => {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : "";

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

    // Page-specific JSON-LD (kept separate from the site-wide schema in index.html).
    let jsonLdEl = document.querySelector("script[data-seo-jsonld]") as HTMLScriptElement | null;
    if (jsonLdString) {
      if (!jsonLdEl) {
        jsonLdEl = document.createElement("script");
        jsonLdEl.setAttribute("type", "application/ld+json");
        jsonLdEl.setAttribute("data-seo-jsonld", "");
        document.head.appendChild(jsonLdEl);
      }
      jsonLdEl.textContent = jsonLdString;
    } else if (jsonLdEl) {
      jsonLdEl.remove();
    }

    return () => {
      document.title = prevTitle;
      const staleJsonLd = document.querySelector("script[data-seo-jsonld]");
      if (staleJsonLd) staleJsonLd.remove();
    };
  }, [title, description, keywords, canonicalPath, noindex, jsonLdString]);

  return null;
};

export default SEOHead;
