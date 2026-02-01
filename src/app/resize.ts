import type { Application } from "pixi.js";
import type { DressUpView } from "../dressup/DressUpView";

export function bindResize(
  stageHost: HTMLElement,
  app: Application,
  dressup: DressUpView,
) {
  const applyRendererSize = () => {
    const w = Math.max(1, stageHost.clientWidth);
    const h = Math.max(1, stageHost.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    app.renderer.resolution = dpr;
    app.renderer.resize(w, h);
    dressup.layout();
  };

  const ro = new ResizeObserver(() => {
    applyRendererSize();
  });
  ro.observe(stageHost);

  const onResize = () => applyRendererSize();
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
}
