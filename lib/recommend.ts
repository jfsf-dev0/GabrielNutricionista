import { violations, normalize } from "./foods";
import type { Food, Macros, MealItem, Restrictions } from "./types";

/**
 * Recomendações determinísticas e explicáveis: cada sugestão traz os números
 * que a justificam. Nada aqui usa IA; o nutricionista decide.
 */

export interface RecommendOptions {
  restricoes?: Restrictions;
  /** foodId -> quantas vezes o nutricionista já usou. Sobe no ranking. */
  favoritos?: Map<number, number>;
  limit?: number;
}

const FAV_BONUS = 3;
const FAV_CAP = 5;
const ALCOOL = /\b(cerveja|vinho|cachaca|whisky|vodka|aguardente|conhaque|licor|pinga)\b/;

/** Grupos que não fazem sentido como "complemento de refeição" (continuam disponíveis na busca manual). */
const NAO_COMPLETAR = new Set([
  "Bebidas (alcoólicas e não alcoólicas)",
  "Produtos açucarados",
  "Outros alimentos industrializados",
  "Miscelâneas",
  "Gorduras e óleos",
]);
const CRU_OU_PO = /\b(cru|crua|crus|cruas|po|desidratad\w*|instantane\w*)\b/;
const DOCES = /\b(condensado|doce|sorvete|chocolate|achocolatado|bombom|brigadeiro|gelatina|pudim|mousse|cocada|goiabada|marshmallow|refrigerante|geleia|calda)\b/;

/** Estado de preparo do alimento (cru, cozido, grelhado…), usado para não trocar cozido por seco. */
export function prepState(nome: string): string | null {
  const m = normalize(nome).match(/\b(cru|crua|crus|cruas|cozid\w*|assad\w*|grelhad\w*|frit\w*|refogad\w*|ensopad\w*|torrad\w*)/);
  if (!m) return null;
  return /^cru/.test(m[1]) ? "cru" : m[1].slice(0, 5);
}
/** Estado de preparo é quase categórico: cozido por cozido primeiro, só depois os demais. */
const PREPARO_DIFERENTE = 60;
const PORCAO_PESO = 6;

const round5 = (g: number) => Math.round(g / 5) * 5;
const macrosOf = (food: Food, gramas: number): Macros => ({
  kcal: ((food.n.kcal ?? 0) * gramas) / 100,
  p: ((food.n.p ?? 0) * gramas) / 100,
  c: ((food.n.c ?? 0) * gramas) / 100,
  l: ((food.n.l ?? 0) * gramas) / 100,
});
const favBonus = (o: RecommendOptions, id: number) =>
  FAV_BONUS * Math.min(o.favoritos?.get(id) ?? 0, FAV_CAP);
const eligible = (f: Food, o: RecommendOptions) =>
  (f.n.kcal ?? 0) > 0 &&
  !ALCOOL.test(normalize(f.nome)) &&
  (!o.restricoes || violations(f, o.restricoes).length === 0);

export interface Substitution {
  food: Food;
  gramas: number;
  macros: Macros;
  /** sugerido - original (na gramatura sugerida). */
  delta: Macros;
  /** Menor = mais parecido. Já desconta favoritos. */
  score: number;
}

/** Troca por alimento do mesmo grupo, em gramatura que iguala as kcal do original. */
export function suggestSubstitutions(
  item: MealItem,
  foods: Food[],
  opts: RecommendOptions = {},
): Substitution[] {
  if (item.foodId === undefined || item.nota) return [];
  const base = foods.find((f) => f.id === item.foodId);
  if (!base || item.gramas <= 0) return [];

  const orig = macrosOf(base, item.gramas);
  const out: Substitution[] = [];
  for (const cand of foods) {
    if (cand.id === base.id || cand.grupo !== base.grupo || !eligible(cand, opts)) continue;
    const gramas = Math.max(5, round5((orig.kcal / cand.n.kcal!) * 100));
    const macros = macrosOf(cand, gramas);
    const delta: Macros = {
      kcal: macros.kcal - orig.kcal, p: macros.p - orig.p, c: macros.c - orig.c, l: macros.l - orig.l,
    };
    const score =
      Math.abs(delta.p) * 4 + Math.abs(delta.c) * 4 + Math.abs(delta.l) * 9 + Math.abs(delta.kcal) * 0.5 +
      (prepState(cand.nome) !== prepState(base.nome) ? PREPARO_DIFERENTE : 0) +
      PORCAO_PESO * Math.abs(Math.log(gramas / item.gramas)) -
      favBonus(opts, cand.id);
    out.push({ food: cand, gramas, macros, delta, score });
  }
  return out.sort((a, b) => a.score - b.score).slice(0, opts.limit ?? 5);
}

export interface Completion {
  food: Food;
  gramas: number;
  macros: Macros;
  /** O que ainda falta depois de adicionar (negativo = passa da meta). */
  residual: Macros;
  score: number;
}

const err = (rem: number, w: number) => (rem >= 0 ? rem * w : -rem * w * 2);
const totalErr = (r: Macros) => err(r.p, 4) + err(r.c, 4) + err(r.l, 9);

/**
 * Sugere alimento e porção que mais reduzem o que falta para a meta
 * (penaliza mais o excesso que a falta).
 */
export function suggestToComplete(
  falta: Macros,
  foods: Food[],
  opts: RecommendOptions = {},
): Completion[] {
  if (falta.kcal <= 0) return [];
  const baseline = totalErr(falta);
  if (baseline <= 0) return [];

  const out: Completion[] = [];
  for (const food of foods) {
    if (!eligible(food, opts) || NAO_COMPLETAR.has(food.grupo) || CRU_OU_PO.test(normalize(food.nome)) || DOCES.test(normalize(food.nome))) continue;
    let best: { gramas: number; e: number; macros: Macros } | null = null;
    for (let g = 10; g <= 300; g += 5) {
      const m = macrosOf(food, g);
      if (m.kcal > falta.kcal * 1.15) break; // não ultrapassa a meta calórica em mais de 15%
      const e = totalErr({ kcal: 0, p: falta.p - m.p, c: falta.c - m.c, l: falta.l - m.l });
      if (!best || e < best.e) best = { gramas: g, e, macros: m };
    }
    if (!best || best.e >= baseline * 0.85) continue;
    out.push({
      food,
      gramas: best.gramas,
      macros: best.macros,
      residual: {
        kcal: falta.kcal - best.macros.kcal,
        p: falta.p - best.macros.p,
        c: falta.c - best.macros.c,
        l: falta.l - best.macros.l,
      },
      score: best.e - favBonus(opts, food.id),
    });
  }
  return out.sort((a, b) => a.score - b.score).slice(0, opts.limit ?? 6);
}
