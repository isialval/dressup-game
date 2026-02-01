import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_ASSETS = path.join(ROOT, "public", "assets");
const OUT_FILE = path.join(ROOT, "src", "catalog", "index.ts");

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const CATEGORY_TO_LAYER = {
  dresses: "dress",
  hair: "hair",
  shoes: "shoes",
  pants: "pants",
  shorts: "shorts",
  skirts: "skirt",
  tops: "top",
  pets: "pets",
  backgrounds: "background",
};

const THUMB_RE = /^(.*?)(?:[ _.-]?thumbnail)$/i;

function titleFromFileName(fileName) {
  const base = fileName.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function idFrom(category, fileName) {
  const base = fileName.replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${category}/${slug}`;
}

function readDirSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function normalizeKey(s) {
  return s.toLowerCase().trim();
}

function splitThumbBase(baseNoExt) {
  const m = baseNoExt.match(THUMB_RE);
  if (!m) return { isThumb: false, mainBase: baseNoExt };
  return { isThumb: true, mainBase: (m[1] ?? "").trim() };
}

const EXT_PRIORITY = [".webp", ".png", ".jpg", ".jpeg"];

function main() {
  if (!fs.existsSync(PUBLIC_ASSETS)) {
    console.error(`âŒ No existe: ${PUBLIC_ASSETS}`);
    process.exit(1);
  }

  const catalog = {};
  const categoriesInOrder = Object.keys(CATEGORY_TO_LAYER);

  for (const category of categoriesInOrder) {
    const layer = CATEGORY_TO_LAYER[category];
    const folderPath = path.join(PUBLIC_ASSETS, category);
    if (!fs.existsSync(folderPath)) continue;

    const files = readDirSafe(folderPath)
      .filter((f) => f.isFile())
      .map((f) => f.name)
      .filter((name) => IMG_EXT.has(path.extname(name).toLowerCase()));

    const thumbCandidatesByBase = new Map();

    for (const fileName of files) {
      const ext = path.extname(fileName).toLowerCase();
      const base = fileName.slice(0, -ext.length);
      const { isThumb, mainBase } = splitThumbBase(base);

      if (!isThumb) continue;
      const key = normalizeKey(mainBase);
      if (!key) continue;

      const arr = thumbCandidatesByBase.get(key) ?? [];
      arr.push(fileName);
      thumbCandidatesByBase.set(key, arr);
    }

    const thumbByBase = new Map();
    for (const [baseKey, arr] of thumbCandidatesByBase.entries()) {
      const sorted = [...arr].sort((a, b) => {
        const ea = path.extname(a).toLowerCase();
        const eb = path.extname(b).toLowerCase();
        const pa = EXT_PRIORITY.indexOf(ea);
        const pb = EXT_PRIORITY.indexOf(eb);
        const ra = pa === -1 ? 999 : pa;
        const rb = pb === -1 ? 999 : pb;
        if (ra !== rb) return ra - rb;
        return a.localeCompare(b);
      });
      thumbByBase.set(baseKey, sorted[0]);
    }

    const mainFiles = files.filter((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      const base = fileName.slice(0, -ext.length);
      const { isThumb } = splitThumbBase(base);
      return !isThumb;
    });

    const items = mainFiles
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => {
        const ext = path.extname(fileName).toLowerCase();
        const base = fileName.slice(0, -ext.length);
        const baseKey = normalizeKey(base);

        const thumbFile = thumbByBase.get(baseKey);
        const thumb = thumbFile ? `/assets/${category}/${thumbFile}` : undefined;

        return {
          id: idFrom(category, fileName),
          name: titleFromFileName(fileName),
          category,
          layer,
          src: `/assets/${category}/${fileName}`,
          ...(thumb ? { thumb } : {}),
        };
      });

    catalog[category] = items;
  }

  const content = `import type { Category } from "./config";
import type { ItemDef } from "./types";

export const catalog: Record<Category, ItemDef[]> = ${JSON.stringify(
    catalog,
    null,
    2,
  )} as any;
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, content, "utf8");

  console.log(`âœ… Catalog generado: ${path.relative(ROOT, OUT_FILE)}`);
}

main();
