import type { Food, RestrictionKey, Restrictions } from "./types";

export const RESTRICTION_LABELS: Record<RestrictionKey, string> = {
  lactose: "Lactose / laticínios",
  gluten: "Glúten",
  ovo: "Ovo",
  amendoim: "Amendoim",
  oleaginosas: "Oleaginosas (castanhas, nozes…)",
  frutosDoMar: "Frutos do mar",
  soja: "Soja",
  vegetariano: "Vegetariano",
  vegano: "Vegano",
};

export const normalize = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Distância de Damerau-Levenshtein (transposição adjacente conta 1). */
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

const normCache = new WeakMap<Food, string>();
const normName = (f: Food) => {
  let v = normCache.get(f);
  if (v === undefined) normCache.set(f, (v = normalize(f.nome)));
  return v;
}

function scoreExact(name: string, tokens: string[]): number | null {
  const words = name.split(" ");
  let score = 0;
  for (const t of tokens) {
    if (words.some((w) => w.startsWith(t))) score += 2;
    else if (name.includes(t)) score += 1;
    else return null;
  }
  if (name.startsWith(tokens[0])) score += 2;
  return score - name.length / 200;
}

function scoreFuzzy(name: string, tokens: string[]): number | null {
  const words = name.split(" ");
  let score = 0;
  for (const t of tokens) {
    const tol = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;
    let best = Infinity;
    for (const w of words) {
      const cmp = w.length > t.length ? w.slice(0, t.length + 1) : w;
      best = Math.min(best, editDistance(t, w), editDistance(t, cmp));
    }
    if (best > tol) return null;
    score += 2 - best;
  }
  return score - name.length / 200;
}

/** Busca por todos os termos (prefixo de palavra ou trecho); sem resultado, tenta tolerância a erro de digitação. */
export function searchFoods(foods: Food[], query: string, limit = 20): Food[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const rank = (fn: (name: string, t: string[]) => number | null) =>
    foods
      .map((f) => ({ f, s: fn(normName(f), tokens) }))
      .filter((x): x is { f: Food; s: number } => x.s !== null)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.f);

  const exact = rank(scoreExact);
  if (exact.length > 0 || tokens.join("").length < 3) return exact;
  return rank(scoreFuzzy);
}

const NAME_RULES: Partial<Record<RestrictionKey, RegExp>> = {
  lactose: /\b(leite|queijo|iogurte|requeijao|manteiga|creme de leite|coalhada|nata|doce de leite|ricota|mucarela)\b/,
  gluten: /\b(trigo|pao|macarrao|bolo|biscoito|bolacha|cevada|centeio|aveia|pizza|torrada|panqueca|lasanha|pastel|gluten|cuscuz de trigo|farinha de rosca)\b/,
  ovo: /\bovos?\b/,
  amendoim: /\bamendoim\b/,
  oleaginosas: /\b(castanha|noz|nozes|amendoa|avela|pistache|macadamia)\b/,
  frutosDoMar: /\b(camarao|lagosta|caranguejo|siri|mexilhao|ostra|lula|polvo|marisco|vieira)\b/,
  soja: /\b(soja|tofu|shoyu|missô|miso)\b/,
};

const G_CARNES = "Carnes e derivados";
const G_PESCADOS = "Pescados e frutos do mar";
const G_OVOS = "Ovos e derivados";
const G_LEITE = "Leite e derivados";

function matchesTag(food: Food, tag: RestrictionKey): boolean {
  const name = normName(food);
  switch (tag) {
    case "lactose":
      return food.grupo === G_LEITE || !!NAME_RULES.lactose?.test(name);
    case "ovo":
      return food.grupo === G_OVOS || !!NAME_RULES.ovo?.test(name);
    case "vegetariano":
      return food.grupo === G_CARNES || food.grupo === G_PESCADOS;
    case "vegano":
      return (
        food.grupo === G_CARNES || food.grupo === G_PESCADOS || food.grupo === G_OVOS ||
        food.grupo === G_LEITE || /\b(mel|gelatina)\b/.test(name)
      );
    default:
      return !!NAME_RULES[tag]?.test(name);
  }
}

/**
 * Restrições que o alimento pode violar (tags marcadas + termos livres).
 * Baseado em grupo e nome: é um alerta, não garantia. O nutricionista confirma.
 */
export function violations(food: Food, r: Restrictions): string[] {
  const out: string[] = r.tags.filter((t) => matchesTag(food, t));
  const name = normName(food);
  for (const termo of r.termos.split(",").map((t) => t.trim()).filter(Boolean)) {
    const n = normalize(termo);
    if (n && name.includes(n)) out.push(termo);
  }
  return out;
}

let cache: Promise<Food[]> | null = null;

/** Carrega a base de alimentos (uma vez por sessão). */
export function loadFoods(): Promise<Food[]> {
  if (!cache) {
    cache = fetch("/foods.json")
      .then((r) => {
        if (!r.ok) throw new Error(`foods.json: HTTP ${r.status}`);
        return r.json() as Promise<Food[]>;
      })
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}
