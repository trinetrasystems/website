import { defineConfig, loadEnv, type Plugin } from "vite";
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

// Serves the Vercel functions in /api during `npm run dev`, so the email
// notifications can be exercised locally. Production uses Vercel's runtime.
function apiDevServer(): Plugin {
  return {
    name: "api-dev-server",
    apply: "serve",
    configureServer(server) {
      // Server-only secrets (SMTP_*, FIREBASE_SERVICE_ACCOUNT, …) from .env.
      const env = loadEnv(server.config.mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (!key.startsWith("VITE_") && process.env[key] === undefined) process.env[key] = value;
      }
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || "").split("?")[0];
        if (!pathname.startsWith("/api/") || pathname.includes("..") || /\/_/.test(pathname)) return next();
        const file = path.resolve(__dirname, `.${pathname}.ts`);
        if (!fs.existsSync(file)) return next();
        try {
          const mod = await server.ssrLoadModule(file);
          await mod.default(req, res);
        } catch (error) {
          server.config.logger.error(String(error));
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Dev API error" }));
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), pptManifest(), apiDevServer()],
  resolve: {
    alias: [
      // `vite --mode e2e` swaps Firebase for the in-memory fake in e2e/fake-firebase
      // so Playwright can drive the real UI without touching the live project.
      ...(mode === "e2e"
        ? [
            { find: /^firebase\/app$/, replacement: path.resolve(__dirname, "./e2e/fake-firebase/app.ts") },
            { find: /^firebase\/auth$/, replacement: path.resolve(__dirname, "./e2e/fake-firebase/auth.ts") },
            { find: /^firebase\/firestore$/, replacement: path.resolve(__dirname, "./e2e/fake-firebase/firestore.ts") },
          ]
        : []),
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  assetsInclude: ["**/*.MP4", "**/*.PNG", "**/*.JPG", "**/*.JPEG", "**/*.png", "**/*.jpg", "**/*.jpeg"],
}));
