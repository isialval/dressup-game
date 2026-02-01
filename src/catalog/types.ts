import type { Category, LayerName } from "./config";

export type ItemDef = {
  id: string;
  name: string;
  category: Category;
  layer: LayerName;
  src: string;
  thumb?: string;
};
