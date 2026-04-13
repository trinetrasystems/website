/// <reference types="vite/client" />

declare module "*.PNG" {
  const content: string;
  export default content;
}
