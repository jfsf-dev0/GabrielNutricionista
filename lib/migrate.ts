import { emptyProfile, uid } from "./profile";
import type { Meal, MealItem, MealOption, PatientProfile } from "./types";
import { SCHEMA_VERSION } from "./types";

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
    gramas: m ? Number(m[1].replace(",", ".")) : 0,
  };
  if (qty) item.medida = qty;
  return item;
}

const stripTags = (s: unknown) => String(s ?? "").replace(/<[^>]*>/g, "");
const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);

function legacyOption(o: any): MealOption {
  return {
    id: uid(),
    titulo: String(o?.titulo ?? ""),
    itens: Array.isArray(o?.itens) ? o.itens.map((l: unknown) => parseLegacyItem(String(l))) : [],
    extra: { kcal: Number(o?.cal) || 0, p: Number(o?.p) || 0, c: Number(o?.c) || 0, l: Number(o?.l) || 0 },
  };
}

function migrateMeals(raw: unknown): Meal[] {
  if (Array.isArray(raw)) return raw as Meal[];
  if (!isObj(raw)) return [];
  return Object.values(raw)
    .map((m: any) => ({
      id: Number(m.id) || 0,
      nome: String(m.nome ?? ""),
      horario: String(m.horario ?? ""),
      opcoes: [legacyOption(m.optA), legacyOption(m.optB)],
    }))
    .sort((a, b) => a.id - b.id);
}

/**
 * Aceita perfil v2, perfil legado (v1: refeições em Record, opções A/B fixas,
 * micronutrientes em HTML) ou lixo. Sempre devolve um perfil v2 válido.
 */
export function migrateProfile(raw: unknown): PatientProfile {
  const base = emptyProfile();
  if (!isObj(raw)) return { ...base, meals: [] };

  const legacy = raw.versao !== SCHEMA_VERSION;
  const merged: PatientProfile = {
    ...base,
    ...(raw as Partial<PatientProfile>),
    id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
    versao: SCHEMA_VERSION,
    atualizadoEm: typeof raw.atualizadoEm === "string" ? raw.atualizadoEm : new Date().toISOString(),
    antropometria: isObj(raw.antropometria) ? raw.antropometria : {},
    restricoes: {
      tags: Array.isArray(raw.restricoes?.tags) ? raw.restricoes.tags : [],
      termos: typeof raw.restricoes?.termos === "string" ? raw.restricoes.termos : "",
    },
    suplementos: Array.isArray(raw.suplementos) ? raw.suplementos : [],
    receita: { ...base.receita, ...(isObj(raw.receita) ? raw.receita : {}) },
    meals: migrateMeals(raw.meals),
  };

  if (legacy) {
    merged.micros = {
      modo: "manual",
      lipideos: stripTags(raw.lipideosStr),
      minerais: stripTags(raw.mineraisStr),
      vitaminas: stripTags(raw.vitaminasStr),
    };
    // remove campos do formato antigo
    delete (merged as any).lipideosStr;
    delete (merged as any).mineraisStr;
    delete (merged as any).vitaminasStr;
  } else {
    merged.micros = { ...base.micros, ...(isObj(raw.micros) ? raw.micros : {}) };
  }
  return merged;
}
