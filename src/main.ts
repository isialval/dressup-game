import "./style.css";
import { DressUpView, type LayerName } from "./dressup/DressUpView";
import { catalog } from "./catalog";
import { renderPanels } from "./ui/renderPanels";
import type { Category } from "./catalog/config";
import { mustGet } from "./ui/dom";
import {
  bindCategoryClicks,
  orderCategories,
  renderCategories,
  setPanel,
} from "./ui/categories";
import { initPixiApp } from "./app/pixi";
import { bindResize } from "./app/resize";
import { createDressupController } from "./dressup/controller";

async function start() {
  const stageHost = mustGet<HTMLElement>("#stage");
  const stageFrame = mustGet<HTMLElement>("#stage-frame");
  const ui = mustGet<HTMLElement>("#ui");
  const categoriesEl = mustGet<HTMLElement>("#categories");

  const zTools = mustGet<HTMLElement>("#ztools");
  const zLabel = mustGet<HTMLElement>("#zlabel");
  const zBack = mustGet<HTMLButtonElement>("#zback");
  const zFront = mustGet<HTMLButtonElement>("#zfront");
  const zClose = mustGet<HTMLElement>("#zclose");

  renderPanels(ui, catalog);

  const rawKeys = Object.keys(catalog) as Category[];
  const categoryKeys = orderCategories(rawKeys);
  renderCategories(categoriesEl, categoryKeys);

  const app = await initPixiApp(stageHost);
  const dressup = new DressUpView(app);
  await dressup.setItem("base", "/assets/base.webp");

  bindResize(stageHost, app, dressup);

  setPanel(categoryKeys[0] ?? "");

  bindCategoryClicks(categoriesEl, setPanel);

  const controller = createDressupController(dressup, zTools, zLabel);
  controller.updateZToolsVisibility();

  const defaultBg = catalog.backgrounds.find(
    (item) => item.id === "backgrounds/bg2",
  );
  if (defaultBg) await controller.setDefaultBackground(defaultBg.src);

  ui.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!btn) return;

    const layer = btn.dataset.layer as LayerName | undefined;
    const src = btn.dataset.src;
    if (!layer || src === undefined) return;

    await controller.equip(layer, src);
  });

  zBack.addEventListener("click", () => {
    dressup.sendBackward(controller.getSelectedLayer());
  });

  zFront.addEventListener("click", () => {
    dressup.bringForward(controller.getSelectedLayer());
  });

  zClose.addEventListener("click", () => {
    controller.dismissZTools();
  });

  stageFrame.addEventListener("click", (e) => {
    if (!controller.isZToolsVisible()) return;
    if ((e.target as HTMLElement).closest("#ztools")) return;
    controller.dismissZTools();
  });
}

start();
