import * as PIXI from "pixi.js";

export async function initPixiApp(stageHost: HTMLElement) {
  const app = new PIXI.Application();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  await app.init({
    resizeTo: stageHost,
    backgroundAlpha: 0,
    antialias: true,
    resolution: dpr,
    autoDensity: true,
  });
  stageHost.appendChild(app.canvas);
  return app;
}
