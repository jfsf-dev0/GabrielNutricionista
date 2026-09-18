import { clampNum, MAX_GRAMAS, MAX_GRAMAS_MACRO, MAX_KCAL, MAX_TEXTO } from "./limits";
import { emptyProfile, uid } from "./profile";
import type {
  Antropometria, Macros, Meal, MealItem, MealOption, MicrosTexto, PatientProfile, Recipe,
  RestrictionKey, Restrictions, Supplement,
} from "./types";
import { SCHEMA_VERSION } from "./types";

const TAGS: RestrictionKey[] = ["lactose", "gluten", "ovo", "amendoim", "oleaginosas", "frutosDoMar", "soja", "vegetariano", "vegano"];

const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string =>
  (typeof v === "string" ? v : v == null ? fallback : typeof v === "object" ? fallback : String(v)).slice(0, MAX_TEXTO);
const stripTags = (s: unknown) => str(s).replace(/<[^>]*>/g, "");

/** Converte "Arroz | 80 g" (formato antigo, texto livre) em item estruturado sem vínculo com a base. */
export function parseLegacyItem(line: string): MealItem {
  const text = line.trim();
  if (/^(↳|\*|—)/.test(text)) return { id: uid(), nome: text, gramas: 0, nota: true };

  const [nome, ...rest] = text.split("|");
  const qty = rest.join("|").trim();
  const m = qty.match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)\b/i);
  const item: MealItem = {
    id: uid(),
    nome: nome.trim(),
    gramas: m ? clampNum(m[1], 0, MAX_GRAMAS) : 0,
  };
  if (qty) item.medida = qty;
  return item;
}

function sanitizeItem(raw: unknown): MealItem | null {
  if (!isObj(raw)) return null;
  const foodId = Number.isInteger(raw.foodId) && raw.foodId >= 0 ? (raw.foodId as number) : undefined;
  const item: MealItem = {
    id: str(raw.id) || uid(),
    nome: str(raw.nome),
    gramas: clampNum(raw.gramas, 0, MAX_GRAMAS),
  };
  if (foodId !== undefined) item.foodId = foodId;
  const medida = str(raw.medida);
  if (medida) item.medida = medida;
  if (raw.nota === true) item.nota = true;
  return item;
}

function sanitizeMacros(raw: unknown): Macros {
  const o = isObj(raw) ? raw : {};
  return {
    kcal: clampNum(o.kcal, 0, MAX_KCAL),
    p: clampNum(o.p, 0, MAX_GRAMAS_MACRO),
    c: clampNum(o.c, 0, MAX_GRAMAS_MACRO),
    l: clampNum(o.l, 0, MAX_GRAMAS_MACRO),
  };
}

function sanitizeOption(raw: unknown): MealOption | null {
  if (!isObj(raw)) return null;
  return {
    id: str(raw.id) || uid(),
    titulo: str(raw.titulo),
    itens: Array.isArray(raw.itens) ? raw.itens.map(sanitizeItem).filter((i): i is MealItem => i !== null) : [],
    extra: sanitizeMacros(raw.extra),
  };
}

function sanitizeMeals(raw: unknown): Meal[] {
  const list = Array.isArray(raw) ? raw : isObj(raw) ? Object.values(raw) : [];
  const used = new Set<number>();
  const meals: Meal[] = [];
  for (const m of list) {
    if (!isObj(m)) continue;
    let id = Number.isInteger(m.id) && m.id > 0 ? (m.id as number) : 0;
    if (!id || used.has(id)) id = Math.max(0, ...used) + 1;
    used.add(id);
    meals.push({
      id,
      nome: str(m.nome),
      horario: str(m.horario),
      opcoes: Array.isArray(m.opcoes) ? m.opcoes.map(sanitizeOption).filter((o): o is MealOption => o !== null) : [],
    });
  }
  return meals;
}

function legacyOption(o: any) {
  return {
    id: uid(),
    titulo: str(o?.titulo),
    itens: Array.isArray(o?.itens) ? o.itens.map((l: unknown) => parseLegacyItem(str(l))) : [],
    extra: { kcal: o?.cal, p: o?.p, c: o?.c, l: o?.l },
  };
}

function legacyMeals(raw: unknown) {
  if (!isObj(raw)) return [];
  return Object.values(raw)
    .map((m: any) => ({
      id: Number(m?.id) || 0,
      nome: str(m?.nome),
      horario: str(m?.horario),
      opcoes: [legacyOption(m?.optA), legacyOption(m?.optB)],
    }))
    .sort((a, b) => a.id - b.id);
}

function sanitizeSupplements(raw: unknown): Supplement[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObj).map((s) => ({ id: str(s.id) || uid(), nome: str(s.nome), posologia: str(s.posologia), obs: str(s.obs) }));
}

function sanitizeRestrictions(raw: unknown): Restrictions {
  const o = isObj(raw) ? raw : {};
  const tags = Array.isArray(o.tags) ? (o.tags.filter((t: unknown) => TAGS.includes(t as RestrictionKey)) as RestrictionKey[]) : [];
  return { tags: [...new Set(tags)], termos: str(o.termos) };
}

function sanitizeAntropometria(raw: unknown): Antropometria {
  const o = isObj(raw) ? raw : {};
  const out: Antropometria = {};
  const put = (k: "peso" | "altura" | "idade" | "atividade", min: number, max: number) => {
    // fora do intervalo plausível = dado ausente (nunca "esticar" para um valor clínico inventado)
    const v = clampNum(o[k], -Infinity, Infinity, NaN);
    if (v >= min && v <= max) out[k] = v;
  };
  put("peso", 1, 500);
  put("altura", 30, 260);
  put("idade", 1, 120);
  put("atividade", 1, 3);
  if (o.sexo === "M" || o.sexo === "F") out.sexo = o.sexo;
  if (o.objetivo === "perda" || o.objetivo === "manutencao" || o.objetivo === "ganho") out.objetivo = o.objetivo;
  return out;
}

function sanitizeRecipe(raw: unknown, base: Recipe): Recipe {
  const o = isObj(raw) ? raw : {};
  return { nome: str(o.nome, base.nome), rendimento: str(o.rendimento, base.rendimento), ingredientes: str(o.ingredientes, base.ingredientes), preparo: str(o.preparo, base.preparo) };
}

/**
 * Aceita perfil v2, perfil legado (v1: refeições em Record, opções A/B fixas,
 * micronutrientes em HTML) ou lixo. Sempre devolve um perfil v2 válido, com
 * números finitos dentro de limites e sem estruturas faltando.
 */
export function migrateProfile(raw: unknown): PatientProfile {
  const base = emptyProfile();
  if (!isObj(raw)) return { ...base, meals: [] };

  const legacy = raw.versao !== SCHEMA_VERSION;
  const micros: MicrosTexto = legacy
    ? { modo: "manual", lipideos: stripTags(raw.lipideosStr), minerais: stripTags(raw.mineraisStr), vitaminas: stripTags(raw.vitaminasStr) }
    : {
        modo: isObj(raw.micros) && raw.micros.modo === "manual" ? "manual" : "auto",
        lipideos: str(isObj(raw.micros) ? raw.micros.lipideos : ""),
        minerais: str(isObj(raw.micros) ? raw.micros.minerais : ""),
        vitaminas: str(isObj(raw.micros) ? raw.micros.vitaminas : ""),
      };

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 200) : uid(),
    versao: SCHEMA_VERSION,
    atualizadoEm: typeof raw.atualizadoEm === "string" ? raw.atualizadoEm : new Date().toISOString(),
    paciente: str(raw.paciente),
    data: str(raw.data, base.data),
    fase: str(raw.fase),
    nutricionista: str(raw.nutricionista),
    crn: str(raw.crn),
    telefone: str(raw.telefone),
    local: str(raw.local),
    calorias: clampNum(raw.calorias, 0, MAX_KCAL),
    prot: clampNum(raw.prot, 0, MAX_GRAMAS_MACRO),
    carbo: clampNum(raw.carbo, 0, MAX_GRAMAS_MACRO),
    gord: clampNum(raw.gord, 0, MAX_GRAMAS_MACRO),
    fibras: clampNum(raw.fibras, 0, MAX_GRAMAS_MACRO),
    agua: str(raw.agua, base.agua),
    antropometria: sanitizeAntropometria(raw.antropometria),
    restricoes: sanitizeRestrictions(raw.restricoes),
    suplementos: sanitizeSupplements(raw.suplementos),
    meals: sanitizeMeals(legacy ? legacyMeals(raw.meals) : raw.meals),
    receita: sanitizeRecipe(raw.receita, base.receita),
    micros,
  };
}
