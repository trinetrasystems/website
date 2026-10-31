// Fake "firebase/app" for e2e mode.
const apps: { name: string; options: unknown }[] = [];
export const getApps = () => apps;
export const initializeApp = (options: unknown, name = "[DEFAULT]") => {
  const app = { name, options };
  apps.push(app);
  return app;
};
