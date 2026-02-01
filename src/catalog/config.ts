export const CATEGORY_TO_LAYER = {
  dresses: "dress",
  hair: "hair",
  shoes: "shoes",
  pants: "pants",
  shorts: "shorts",
  skirts: "skirt",
  tops: "top",
  pets: "pets",
  backgrounds: "background",
} as const;

export type Category = keyof typeof CATEGORY_TO_LAYER;
export type LayerFromCategory<C extends Category> =
  (typeof CATEGORY_TO_LAYER)[C];
export type LayerName = (typeof CATEGORY_TO_LAYER)[Category];
