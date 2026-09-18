import type {
  Antropometria, Food, Macros, MealOption, Nutrients, NutrientKey, PatientProfile,
} from "./types";

export type FoodIndex = Map<number, Food>;

export const emptyMacros = (): Macros => ({ kcal: 0, p: 0, c: 0, l: 0 });

/** Escala valores por 100 g para `gramas`, sem arredondar (arredondar só na exibição). */
export function scaleNutrients(n: Nutrients, gramas: number): Nutrients {
  const out: Nutrients = {};
  for (const k of Object.keys(n) as NutrientKey[]) {
    const v = n[k];
    if (v !== undefined) out[k] = (v * gramas) / 100;
  }
  return out;
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  const out: Nutrients = { ...a };
  for (const k of Object.keys(b) as NutrientKey[]) {
    const v = b[k];
    if (v !== undefined) out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

export const toMacros = (n: Nutrients): Macros => ({
  kcal: n.kcal ?? 0, p: n.p ?? 0, c: n.c ?? 0, l: n.l ?? 0,
});

export interface OptionTotals {
  n: Nutrients;
  macros: Macros;
  /** false quando não há itens vinculados nem ajuste manual. */
  vazia: boolean;
}

export function optionTotals(option: MealOption, foods: FoodIndex): OptionTotals {
  let n: Nutrients = {};
  let vinculados = 0;
  for (const it of option.itens) {
    if (it.nota || it.foodId === undefined) continue;
    const food = foods.get(it.foodId);
    if (!food) continue;
    n = addNutrients(n, scaleNutrients(food.n, it.gramas));
    vinculados++;
  }
  const e = option.extra;
  const temExtra = e.kcal !== 0 || e.p !== 0 || e.c !== 0 || e.l !== 0;
  n = addNutrients(n, { kcal: e.kcal, p: e.p, c: e.c, l: e.l });
  return { n, macros: toMacros(n), vazia: vinculados === 0 && !temExtra };
}

export interface DayTotals {
  /** Soma das médias das opções de cada refeição. */
  media: Macros;
  min: Macros;
  max: Macros;
  /** Micronutrientes e demais nutrientes na média. */
  nutrientes: Nutrients;
}

export function dayTotals(profile: PatientProfile, foods: FoodIndex): DayTotals {
  let nutrientes: Nutrients = {};
  const min = emptyMacros();
  const max = emptyMacros();
  const keys: (keyof Macros)[] = ["kcal", "p", "c", "l"];

  for (const meal of profile.meals) {
    const totais = meal.opcoes.map((o) => optionTotals(o, foods)).filter((t) => !t.vazia);
    if (totais.length === 0) continue;

    let soma: Nutrients = {};
    for (const t of totais) soma = addNutrients(soma, t.n);
    nutrientes = addNutrients(nutrientes, scaleNutrients(soma, 100 / totais.length));

    for (const k of keys) {
      const vals = totais.map((t) => t.macros[k]);
      min[k] += Math.min(...vals);
      max[k] += Math.max(...vals);
    }
  }
  return { media: toMacros(nutrientes), min, max, nutrientes };
}

export interface BalanceLine {
  meta: number;
  planejado: number;
  /** meta - planejado (positivo = falta). */
  saldo: number;
  /** (planejado - meta) / meta * 100. */
  desvioPct: number;
}

export type Balance = Record<keyof Macros, BalanceLine>;

const line = (meta: number, planejado: number): BalanceLine => ({
  meta,
  planejado,
  saldo: meta - planejado,
  desvioPct: meta === 0 ? 0 : ((planejado - meta) / meta) * 100,
});

export function goalBalance(profile: PatientProfile, planned: Macros): Balance {
  return {
    kcal: line(profile.calorias, planned.kcal),
    p: line(profile.prot, planned.p),
    c: line(profile.carbo, planned.c),
    l: line(profile.gord, planned.l),
  };
}

/** Participação de cada macro nas kcal (4/4/9), em % inteiro. */
export function macroPercents(m: Macros): { p: number; c: number; l: number } {
  if (m.kcal <= 0) return { p: 0, c: 0, l: 0 };
  const pct = (kcal: number) => Math.round((kcal / m.kcal) * 100);
  return { p: pct(m.p * 4), c: pct(m.c * 4), l: pct(m.l * 9) };
}

export interface Goals {
  kcal: number;
  p: number;
  c: number;
  l: number;
  fibras: number;
}

/**
 * Sugestão inicial de metas (Mifflin-St Jeor). É um ponto de partida: o
 * nutricionista ajusta os valores. Proteína 1,8–2,0 g/kg, lipídios 1,0 g/kg,
 * carboidrato fecha o restante, fibras 14 g/1000 kcal.
 */
export function calcGoals(a: Antropometria): Goals | null {
  const { peso, altura, idade, sexo, atividade } = a;
  if (!peso || !altura || !idade || !sexo || !atividade) return null;
  const objetivo = a.objetivo ?? "manutencao";

  const tmb = 10 * peso + 6.25 * altura - 5 * idade + (sexo === "M" ? 5 : -161);
  const get = tmb * atividade;
  const fator = objetivo === "perda" ? 0.8 : objetivo === "ganho" ? 1.1 : 1;
  const kcal = Math.round(get * fator);

  const p = Math.round(peso * (objetivo === "manutencao" ? 1.8 : 2.0));
  const l = Math.round(peso * 1.0);
  const c = Math.max(0, Math.round((kcal - p * 4 - l * 9) / 4));
  return { kcal, p, c, l, fibras: Math.round((kcal / 1000) * 14) };
}

export const r1 = (v: number) => Math.round(v * 10) / 10;
export const r0 = (v: number) => Math.round(v);
