// Types for the Framer-only imports in framer/entry.tsx (Framer provides the runtime).
declare module "framer" {
  export const ControlType: Record<string, string>;
  export const RenderTarget: { canvas: string; preview: string; export: string; thumbnail: string; current(): string };
  export function addPropertyControls(component: unknown, controls: Record<string, unknown>): void;
}
