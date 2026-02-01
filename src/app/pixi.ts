import * as PIXI from "pixi.js";

export async function initPixiApp(stageHost: HTMLElement) {
  const app = new PIXI.Application();
  await app.init({ resizeTo: stageHost, backgroundAlpha: 0, antialias: true });
  stageHost.appendChild(app.canvas);
  return app;
}
