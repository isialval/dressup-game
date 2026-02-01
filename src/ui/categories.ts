import type { Category } from "../catalog/config";

function createCategoryThumbImg(category: string) {
  const img = document.createElement("img");
  img.alt = category;
  img.draggable = false;

  const candidates = [
    `/assets/categories/${category}.webp`,
    `/assets/categories/${category}.webp`,
    `/assets/categories/${category}.webp`,
    `/assets/categories/${category}.webp`,
  ];

  let i = 0;
  img.src = candidates[i];
  img.onerror = () => {
    i++;
    if (i < candidates.length) img.src = candidates[i];
  };

  return img;
}

export function renderCategories(
  categoriesEl: HTMLElement,
  categories: string[],
) {
  categoriesEl.innerHTML = "";
  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.className = "cat";
    btn.type = "button";
    btn.dataset.panel = cat;
    btn.appendChild(createCategoryThumbImg(cat));
    categoriesEl.appendChild(btn);
  }
}

export function orderCategories(keys: Category[]) {
  const arr = [...keys];
  arr.sort((a, b) => {
    if (a === "backgrounds") return 1;
    if (b === "backgrounds") return -1;
    return 0;
  });
  return arr;
}

export function setPanel(name: string) {
  document
    .querySelectorAll<HTMLElement>(".panel")
    .forEach((p) => p.classList.toggle("active", p.dataset.panel === name));

  document
    .querySelectorAll<HTMLButtonElement>(".cat")
    .forEach((b) => b.classList.toggle("active", b.dataset.panel === name));
}

export function bindCategoryClicks(
  categoriesEl: HTMLElement,
  onSelect: (name: string) => void,
) {
  categoriesEl.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".cat");
    if (!btn) return;
    const panel = btn.dataset.panel;
    if (!panel) return;
    onSelect(panel);
  });
}
