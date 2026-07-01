/// <reference types="vite/client" />

declare module "*.PNG" {
  const content: string;
  export default content;
}

declare module "virtual:ppt-manifest" {
  const filenames: string[];
  export default filenames;
}
