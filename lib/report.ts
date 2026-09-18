import type { MealItem, Nutrients, NutrientKey } from "./types";

export const fmt = (v: number, dec = 1): string =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: dec });

/** Quantidade exibida de um item: "30 g (1 col. sopa)", texto legado ou vazio. */
export function itemQty(it: MealItem): string {
  if (it.foodId === undefined) return it.medida ?? (it.gramas > 0 ? `${fmt(it.gramas)} g` : "");
  if (it.gramas <= 0) return it.medida ?? "";
  return `${fmt(it.gramas)} g${it.medida ? ` (${it.medida})` : ""}`;
}

type Spec = [NutrientKey, string, string];

const LIPIDEOS: Spec[] = [["fibras", "Fibras", "g"], ["colesterol", "Colesterol", "mg"]];
const MINERAIS: Spec[] = [
  ["sodio", "Sódio", "mg"], ["potassio", "Potássio", "mg"], ["fosforo", "Fósforo", "mg"],
  ["calcio", "Cálcio", "mg"], ["magnesio", "Magnésio", "mg"], ["ferro", "Ferro", "mg"],
  ["zinco", "Zinco", "mg"], ["cobre", "Cobre", "mg"],
];
const VITAMINAS: Spec[] = [
  ["vitC", "Vit. C", "mg"], ["niacina", "Niacina (B3)", "mg"], ["tiamina", "B1", "mg"],
  ["riboflavina", "B2", "mg"], ["piridoxina", "B6", "mg"], ["retinol", "Retinol", "mcg"],
];

const join = (n: Nutrients, specs: Spec[]) =>
  specs
    .filter(([k]) => n[k] !== undefined)
    .map(([k, label, un]) => `${label}: ${fmt(n[k]!, 1)} ${un}`)
    .join(" · ");

/** Micronutrientes somados dos alimentos, em 3 linhas. Só entram os nutrientes presentes na base. */
export function microGroups(n: Nutrients) {
  return {
    lipideos: join(n, LIPIDEOS),
    minerais: join(n, MINERAIS),
    vitaminas: join(n, VITAMINAS),
  };
}
