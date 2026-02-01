import * as PIXI from "pixi.js";

export type LayerName =
  | "base"
  | "pants"
  | "shorts"
  | "skirt"
  | "dress"
  | "top"
  | "shoes"
  | "hair"
  | "pets"
  | "background";

type ItemLayer = Exclude<LayerName, "background">;

const BOTTOMS: ItemLayer[] = ["pants", "shorts", "skirt"];

function isItemLayer(x: LayerName): x is ItemLayer {
  return x !== "background";
}

export class DressUpView {
  private app: PIXI.Application;

  private bgContainer = new PIXI.Container();
  private bgSprite?: PIXI.Sprite;
  private bgTexW = 0;
  private bgTexH = 0;

  private root = new PIXI.Container();
  private layers: Record<ItemLayer, PIXI.Container>;
  private sprites: Partial<Record<ItemLayer, PIXI.Sprite>> = {};

  private baseW = 0;
  private baseH = 0;

  private topAboveBottom = true;

  private shoesAboveBottom = true;

  constructor(app: PIXI.Application) {
    this.app = app;

    this.app.stage.sortableChildren = true;

    this.bgContainer.zIndex = 0;
    this.root.zIndex = 1;

    this.app.stage.addChild(this.bgContainer);
    this.app.stage.addChild(this.root);

    this.layers = {
      base: new PIXI.Container(),
      pants: new PIXI.Container(),
      shorts: new PIXI.Container(),
      skirt: new PIXI.Container(),
      dress: new PIXI.Container(),
      top: new PIXI.Container(),
      shoes: new PIXI.Container(),
      hair: new PIXI.Container(),
      pets: new PIXI.Container(),
    };

    this.root.sortableChildren = true;

    this.root.addChild(
      this.layers.base,
      this.layers.pants,
      this.layers.shorts,
      this.layers.skirt,
      this.layers.dress,
      this.layers.top,
      this.layers.shoes,
      this.layers.hair,
      this.layers.pets,
    );

    this.layers.base.zIndex = 0;
    this.root.sortChildren();
  }

  async setBackground(src: string) {
    if (!src) {
      if (this.bgSprite) this.bgSprite.visible = false;
      return;
    }

    const texture = await PIXI.Assets.load(src);

    this.bgTexW = texture.width;
    this.bgTexH = texture.height;

    if (!this.bgSprite) {
      this.bgSprite = new PIXI.Sprite(texture);
      this.bgSprite.anchor.set(0.5, 0.5);
      this.bgContainer.addChild(this.bgSprite);
    } else {
      this.bgSprite.texture = texture;
      this.bgSprite.visible = true;
    }

    this.layoutBackground();
  }

  private layoutBackground() {
    if (!this.bgSprite || !this.bgSprite.visible) return;
    if (!this.bgTexW || !this.bgTexH) return;

    const w = this.app.renderer.width;
    const h = this.app.renderer.height;

    const scale = Math.max(w / this.bgTexW, h / this.bgTexH);

    this.bgSprite.position.set(w / 2, h / 2);
    this.bgSprite.scale.set(scale);
  }

  async setItem(layer: ItemLayer, src: string) {
    if (!src) {
      const sp = this.sprites[layer];
      if (sp) sp.visible = false;
      if (layer !== "base") this.recomputeZOrder();
      return;
    }

    const texture = await PIXI.Assets.load(src);

    let sp = this.sprites[layer];
    if (!sp) {
      sp = new PIXI.Sprite(texture);
      sp.anchor.set(0, 0);
      sp.position.set(0, 0);
      this.layers[layer].addChild(sp);
      this.sprites[layer] = sp;
    } else {
      sp.texture = texture;
      sp.visible = true;
    }

    if (layer === "base") {
      this.baseW = texture.width;
      this.baseH = texture.height;
      this.layout();
      return;
    }

    this.recomputeZOrder();
  }

  layout() {
    this.layoutBackground();

    if (!this.baseW || !this.baseH) return;

    const w = this.app.renderer.width;
    const h = this.app.renderer.height;

    const scale = Math.min(w / this.baseW, h / this.baseH) * 0.95;

    this.root.scale.set(scale);

    const drawW = this.baseW * scale;
    const drawH = this.baseH * scale;

    this.root.position.set((w - drawW) / 2, (h - drawH) / 2);
  }

  private isVisible(layer: ItemLayer) {
    const sp = this.sprites[layer];
    return !!sp && sp.visible;
  }

  private getActiveBottom(): ItemLayer | null {
    for (const b of BOTTOMS) {
      if (this.isVisible(b)) return b;
    }
    return null;
  }

  private recomputeZOrder() {
    this.layers.base.zIndex = 0;

    const visibleHair = this.isVisible("hair");
    const visiblePets = this.isVisible("pets");
    const visibleShoes = this.isVisible("shoes");
    const visibleTop = this.isVisible("top");
    const visibleDress = this.isVisible("dress");
    const bottom = this.getActiveBottom();

    const order: ItemLayer[] = [];

    if (visibleDress) {
      if (visibleShoes) order.push("shoes");
      order.push("dress");
    } else {
      if (bottom && visibleTop) {
        const pair: ItemLayer[] = this.topAboveBottom
          ? [bottom, "top"]
          : ["top", bottom];

        if (visibleShoes) {
          const bi = pair.indexOf(bottom);
          if (this.shoesAboveBottom) pair.splice(bi + 1, 0, "shoes");
          else pair.splice(bi, 0, "shoes");
        }

        order.push(...pair);
      } else if (bottom && !visibleTop) {
        if (visibleShoes) {
          if (this.shoesAboveBottom) order.push(bottom, "shoes");
          else order.push("shoes", bottom);
        } else {
          order.push(bottom);
        }
      } else if (!bottom && visibleTop) {
        if (visibleShoes) order.push("shoes", "top");
        else order.push("top");
      } else {
        if (visibleShoes) order.push("shoes");
      }
    }

    if (visibleHair) order.push("hair");

    if (visiblePets) order.push("pets");

    let z = 1;
    for (const layer of order) {
      this.layers[layer].zIndex = z++;
    }

    this.root.sortChildren();
  }

  bringForward(layer: LayerName) {
    if (!isItemLayer(layer)) return;
    if (layer === "hair" || layer === "pets") return;

    if (!this.isVisible(layer)) return;

    if (layer === "shoes") {
      this.shoesAboveBottom = true;
      this.recomputeZOrder();
      return;
    }

    const bottom = this.getActiveBottom();

    if (layer === "top") {
      this.topAboveBottom = true;
      this.recomputeZOrder();
      return;
    }

    if (bottom && layer === bottom) {
      this.topAboveBottom = false;
      this.shoesAboveBottom = false;
      this.recomputeZOrder();
      return;
    }
  }

  sendBackward(layer: LayerName) {
    if (!isItemLayer(layer)) return;
    if (layer === "hair" || layer === "pets") return;

    if (!this.isVisible(layer)) return;

    if (layer === "shoes") {
      this.shoesAboveBottom = false;
      this.recomputeZOrder();
      return;
    }

    const bottom = this.getActiveBottom();

    if (layer === "top") {
      this.topAboveBottom = false;
      this.recomputeZOrder();
      return;
    }

    if (bottom && layer === bottom) {
      this.topAboveBottom = true;
      this.shoesAboveBottom = true;
      this.recomputeZOrder();
      return;
    }
  }
}
