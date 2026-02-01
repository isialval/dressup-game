export function mustGet<T extends Element>(sel: string): T {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Falta elemento: ${sel}`);
  return el;
}
