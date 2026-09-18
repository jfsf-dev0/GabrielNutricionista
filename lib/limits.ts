/** Limites de sanidade para entradas numéricas (UI e importação). */
export const MAX_GRAMAS = 5000;
export const MAX_KCAL = 20000;
export const MAX_GRAMAS_MACRO = 2000;
export const MAX_TEXTO = 5000;

/** Converte para número finito dentro de [min, max]; qualquer coisa inválida vira `fallback`. */
export function clampNum(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
