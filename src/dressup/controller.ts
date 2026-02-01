import type { DressUpView } from "./DressUpView";
import type { LayerName } from "./DressUpView";

export function createDressupController(
  dressup: DressUpView,
  zTools: HTMLElement,
  zLabel: HTMLElement,
) {
  const current: Partial<Record<LayerName, string>> = {};
  let selectedLayer: LayerName = "hair";

  function hasBottomEquipped() {
    return !!(current.pants || current.shorts || current.skirt);
  }

  function updateZToolsVisibility() {
    const shouldShowForTop = selectedLayer === "top";
    const shouldShowForShoes = selectedLayer === "shoes" && hasBottomEquipped();
    const shouldShow = shouldShowForTop || shouldShowForShoes;

    zTools.classList.toggle("hidden", !shouldShow);
    if (shouldShow) zLabel.textContent = `Capa: ${selectedLayer}`;
  }

  function selectLayer(layer: LayerName) {
    selectedLayer = layer;
    updateZToolsVisibility();
  }

  async function clear(layer: LayerName) {
    current[layer] = "";

    if (layer === "background") await dressup.setBackground("");
    else await dressup.setItem(layer as Exclude<LayerName, "background">, "");

    updateZToolsVisibility();
  }

  async function equip(layer: LayerName, src: string) {
    selectLayer(layer);

    if (!src) {
      await clear(layer);
      return;
    }

    if (layer === "background") {
      current.background = src;
      await dressup.setBackground(src);
      updateZToolsVisibility();
      return;
    }

    if (layer === "dress") {
      await clear("pants");
      await clear("shorts");
      await clear("skirt");
      await clear("top");
    }

    if (
      layer === "pants" ||
      layer === "shorts" ||
      layer === "skirt" ||
      layer === "top"
    ) {
      if (current.dress) await clear("dress");
    }

    if (layer === "pants") {
      await clear("shorts");
      await clear("skirt");
    }
    if (layer === "shorts") {
      await clear("pants");
      await clear("skirt");
    }
    if (layer === "skirt") {
      await clear("pants");
      await clear("shorts");
    }

    current[layer] = src;
    await dressup.setItem(layer as Exclude<LayerName, "background">, src);

    updateZToolsVisibility();
  }

  async function setDefaultBackground(src: string) {
    if (!src) return;
    current.background = src;
    try {
      await dressup.setBackground(src);
    } catch {
      current.background = "";
    }
  }

  function getSelectedLayer() {
    return selectedLayer;
  }

  return {
    equip,
    setDefaultBackground,
    updateZToolsVisibility,
    getSelectedLayer,
  };
}
