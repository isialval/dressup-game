import type { Application } from "pixi.js";
import type { DressUpView } from "../dressup/DressUpView";

export function bindResize(
  stageHost: HTMLElement,
  app: Application,
  dressup: DressUpView,
) {
  const ro = new ResizeObserver(() => {
    const w = Math.max(1, stageHost.clientWidth);
    const h = Math.max(1, stageHost.clientHeight);
    app.renderer.resize(w, h);
    dressup.layout();
  });
  ro.observe(stageHost);

  const onResize = () => dressup.layout();
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
}
