import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Exposes the list of presentation files in public/ppts as a virtual module
// ("virtual:ppt-manifest") without importing the binaries themselves — so the
// admin panel can auto-detect uploaded decks with no duplication into the bundle.
function pptManifest() {
  const virtualId = "virtual:ppt-manifest";
  const resolvedId = "\0" + virtualId;
  const readDecks = () => {
    const dir = path.resolve(__dirname, "public/ppts");
    try {
      return fs.readdirSync(dir).filter((f) => /\.pptx?$/i.test(f)).sort();
    } catch {
      return [];
    }
  };
  return {
    name: "ppt-manifest",
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id === resolvedId) {
        return `export default ${JSON.stringify(readDecks())};`;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), pptManifest()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  assetsInclude: ["**/*.MP4", "**/*.PNG", "**/*.JPG", "**/*.JPEG", "**/*.png", "**/*.jpg", "**/*.jpeg"],
}));
