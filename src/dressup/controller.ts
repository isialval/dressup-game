import type { DressUpView } from "./DressUpView";
import type { LayerName } from "./DressUpView";

export function createDressupController(
  dressup: DressUpView,
  zTools: HTMLElement,
  zLabel: HTMLElement,
) {
  const LAYER_LABELS: Record<LayerName, string> = {
    base: "base",
    pants: "pantalones",
    shorts: "shorts",
    skirt: "falda",
    dress: "vestido",
    top: "top",
    shoes: "zapatos",
    hair: "cabello",
    pets: "mascotas",
    background: "fondo",
  };
  const current: Partial<Record<LayerName, string>> = {};
  let selectedLayer: LayerName = "hair";
  let zToolsDismissed = false;

  function hasBottomEquipped() {
    return !!(current.pants || current.shorts || current.skirt);
  }

  function hasTopEquipped() {
    return !!current.top;
  }

  function hasShoesEquipped() {
    return !!current.shoes;
  }

  function isBottomLayer(layer: LayerName) {
    return layer === "pants" || layer === "shorts" || layer === "skirt";
  }

  function updateZToolsVisibility() {
    const shouldShowForTop = selectedLayer === "top";
    const shouldShowForShoes = selectedLayer === "shoes" && hasBottomEquipped();
    const shouldShowForBottom =
      isBottomLayer(selectedLayer) && (hasTopEquipped() || hasShoesEquipped());
    const shouldShow =
      shouldShowForTop || shouldShowForShoes || shouldShowForBottom;

    zTools.classList.toggle("hidden", !shouldShow || zToolsDismissed);
    if (shouldShow) {
      const label = LAYER_LABELS[selectedLayer] ?? selectedLayer;
      zLabel.textContent = `Capa: ${label}`;
    }
  }

  function selectLayer(layer: LayerName) {
    selectedLayer = layer;
    zToolsDismissed = false;
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

  function dismissZTools() {
    zToolsDismissed = true;
    zTools.classList.add("hidden");
  }

  function isZToolsVisible() {
    return !zTools.classList.contains("hidden");
  }

  return {
    equip,
    setDefaultBackground,
    updateZToolsVisibility,
    getSelectedLayer,
    dismissZTools,
    isZToolsVisible,
  };
}
