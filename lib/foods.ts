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

/** Itens que o nutricionista mais prescreve: sobem no ranking (nomes normalizados, início do nome). */
const COMUNS = [
  "arroz tipo 1 cozido", "arroz integral cozido", "feijao carioca cozido", "feijao preto cozido",
  "frango peito sem pele grelhado", "ovo de galinha inteiro cozido", "leite de vaca integral", "leite de vaca desnatado",
  "pao trigo frances", "pao trigo forma integral", "batata inglesa cozida", "batata doce cozida", "mandioca cozida",
  "banana prata crua", "maca fuji com casca crua", "mamao papaia cru", "iogurte natural", "queijo minas frescal",
  "azeite de oliva extra virgem", "aveia flocos crua", "carne bovina patinho sem gordura grelhado", "whey protein",
];

const CRU = /\b(cru|crua|crus|cruas)\b/;
const CRU_SENSIVEL = new Set(["Cereais e derivados", "Carnes e derivados", "Pescados e frutos do mar", "Ovos e derivados", "Leguminosas e derivados", "Leite e derivados"]);
const TUBERCULOS = /^(batata|mandioca|aipim|inhame|abobora|macaxeira)\b/;
const VISCERAS = /\b(coracao|figado|moela|miudos|rim|tripa|lingua|pe|orelha|(?<!sem )pele|pescoco|rabo|bucho|dobradinha|sangue|cabeca|costela|mocoto|tendao)\b/;
const EM_PO = /\bpo\b/;

/** Ajuste de relevância: preparo e cortes comuns primeiro; cru, víscera e pó só quando pedidos. */
function adjust(food: Food, name: string, tokens: string[]): number {
  const q = tokens.join(" ");
  let a = 0;
  if (COMUNS.some((c) => name.startsWith(c)) && !EM_PO.test(name)) a += 3;
  if (CRU.test(name) && (CRU_SENSIVEL.has(food.grupo) || TUBERCULOS.test(name)) && !CRU.test(q)) a -= 3;
  if (VISCERAS.test(name) && !VISCERAS.test(q)) a -= 3;
  if (EM_PO.test(name) && !EM_PO.test(q)) a -= 2;
  return a;
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
      .map((f) => {
        const name = normName(f);
        const base = fn(name, tokens);
        return { f, s: base === null ? null : base + adjust(f, name, tokens) };
      })
      .filter((x): x is { f: Food; s: number } => x.s !== null)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.f);

  const exact = rank(scoreExact);
  if (exact.length > 0 || tokens.join("").length < 3) return exact;
  return rank(scoreFuzzy);
}

const NAME_RULES: Partial<Record<RestrictionKey, RegExp>> = {
  lactose: /\b(leite|queijo|iogurte|requeijao|manteiga|creme de leite|coalhada|nata|doce de leite|ricota|mucarela|whey|caseina)\b/,
  gluten: /\b(trigo|pao|macarrao|bolo|biscoito|bolacha|cevada|centeio|aveia|pizza|torrada|panqueca|lasanha|pastel|gluten|farinha de rosca|coxinha|nhoque|empada|empadao|salgado|kibe|esfiha|croissant|granola|cereal matinal|cereais mistura|farinha lactea|cerveja|shoyu|molho ingles)\b/,
  ovo: /\b(ovos?|maionese|bolo|panqueca|pudim|merengue|mousse|quindim|sorvete)\b/,
  amendoim: /\bamendoim\b/,
  oleaginosas: /\b(castanha|noz|nozes|amendoa|avela|pistache|macadamia)\b/,
  frutosDoMar: /\b(camarao|lagosta|caranguejo|siri|mexilhao|ostra|lula|polvo|marisco|vieira)\b/,
  soja: /\b(soja|tofu|shoyu|missô|miso)\b/,
};

const G_CARNES = "Carnes e derivados";
const G_PESCADOS = "Pescados e frutos do mar";
const G_OVOS = "Ovos e derivados";
const G_LEITE = "Leite e derivados";

/** Nomes que, mesmo em "Leite e derivados", não têm lactose nem são de origem animal (leite de coco, tofu…). */
const NAO_LACTEO = /\b(coco|soja|tofu|vegetal|amendoa|arroz|aveia)\b/;
/** Preparações industrializadas que costumam levar ovo/leite (alerta para vegano). */
const ANIMAL_OCULTO = /\b(biscoito|bolo|pao de queijo|sorvete|chocolate|maionese|panqueca|torta|pudim|doce de leite|manteiga|mel|gelatina|wafer|pizza|lasanha|coxinha|kibe|pastel|empada|empadao|croissant|brigadeiro|quindim|whey|caseina)\b/;

function matchesTag(food: Food, tag: RestrictionKey): boolean {
  const name = normName(food);
  switch (tag) {
    case "lactose":
      if (NAO_LACTEO.test(name)) return false;
      return food.grupo === G_LEITE || !!NAME_RULES.lactose?.test(name);
    case "ovo":
      return food.grupo === G_OVOS || !!NAME_RULES.ovo?.test(name);
    case "vegetariano":
      return food.grupo === G_CARNES || food.grupo === G_PESCADOS;
    case "vegano":
      return (
        food.grupo === G_CARNES || food.grupo === G_PESCADOS || food.grupo === G_OVOS ||
        (food.grupo === G_LEITE && !NAO_LACTEO.test(name)) || ANIMAL_OCULTO.test(name)
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

const TAG_FROM_TEXT: [RestrictionKey, RegExp][] = [
  ["vegano", /\bvegan[oa]s?\b/],
  ["vegetariano", /\bvegetarian[oa]s?\b/],
  ["lactose", /lactose|laticinio/],
  ["gluten", /gluten|celiac/],
  ["ovo", /\bovos?\b/],
  ["amendoim", /amendoim/],
  ["oleaginosas", /oleaginosa|castanha|\bnozes?\b/],
  ["frutosDoMar", /frutos? do mar|marisco|camarao|crustaceo/],
  ["soja", /\bsoja\b/],
];

/** Converte restrições em texto livre do cadastro (ex.: "Intolerância à lactose") em tags do plano. */
export function restrictionsFromStrings(list: string[]): Restrictions {
  const tags = new Set<RestrictionKey>();
  for (const item of list) {
    const n = normalize(item);
    for (const [tag, re] of TAG_FROM_TEXT) if (re.test(n)) tags.add(tag);
  }
  return { tags: [...tags], termos: "" };
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
