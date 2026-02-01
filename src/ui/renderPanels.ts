import type { Category } from "../catalog/config";
import { CATEGORY_TO_LAYER } from "../catalog/config";
import type { ItemDef } from "../catalog/types";

const REMOVE_THUMB_SRC = "/assets/ui/remove.webp";

export function renderPanels(
  uiEl: HTMLElement,
  catalog: Record<Category, ItemDef[]>,
) {
  uiEl.innerHTML = "";

  const categories = Object.keys(catalog) as Category[];

  for (const category of categories) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.dataset.panel = category;

    const layer = CATEGORY_TO_LAYER[category];

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "item item-remove";
    removeBtn.dataset.layer = layer;
    removeBtn.dataset.src = "";
    removeBtn.setAttribute("aria-label", `Quitar ${category}`);

    const removeImg = document.createElement("img");
    removeImg.src = encodeURI(REMOVE_THUMB_SRC);
    removeImg.alt = `Quitar ${category}`;
    removeImg.draggable = false;

    removeBtn.appendChild(removeImg);
    panel.appendChild(removeBtn);

    for (const item of catalog[category]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item";
      btn.dataset.layer = item.layer;
      btn.dataset.src = encodeURI(item.src);

      const img = document.createElement("img");
      img.src = encodeURI(item.thumb ?? item.src);
      img.alt = item.name;
      img.draggable = false;

      btn.appendChild(img);
      panel.appendChild(btn);
    }

    uiEl.appendChild(panel);
  }
}
