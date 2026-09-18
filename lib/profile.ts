import type { Macros, Meal, MealItem, MealOption, PatientProfile } from "./types";
import { SCHEMA_VERSION } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const zeroMacros = (): Macros => ({ kcal: 0, p: 0, c: 0, l: 0 });

export const newOption = (titulo = "Nova opção"): MealOption => ({
  id: uid(), titulo, itens: [], extra: zeroMacros(),
});

export const newMeal = (id: number, nome = "Nova refeição"): Meal => ({
  id, nome, horario: "", opcoes: [newOption("Opção A")],
});

export const newItem = (over: Partial<MealItem> & { nome: string }): MealItem => ({
  id: uid(), gramas: 100, ...over,
});

export const todayPtBr = () =>
  new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

/** Ficha nova: mantém os dados do profissional, zera o resto. */
export function emptyProfile(base?: Pick<PatientProfile, "nutricionista" | "crn" | "telefone" | "local">): PatientProfile {
  return {
    id: uid(),
    versao: SCHEMA_VERSION,
    atualizadoEm: new Date().toISOString(),
    paciente: "",
    data: todayPtBr(),
    fase: "",
    nutricionista: base?.nutricionista ?? "",
    crn: base?.crn ?? "",
    telefone: base?.telefone ?? "",
    local: base?.local ?? "",
    calorias: 2000,
    prot: 150,
    carbo: 200,
    gord: 60,
    fibras: 30,
    agua: "35 ml/kg/dia",
    antropometria: {},
    restricoes: { tags: [], termos: "" },
    suplementos: [],
    meals: [newMeal(1, "Café da Manhã"), newMeal(2, "Almoço"), newMeal(3, "Lanche da Tarde"), newMeal(4, "Jantar")],
    receita: { nome: "", rendimento: "", ingredientes: "", preparo: "" },
    micros: { modo: "auto", lipideos: "", minerais: "", vitaminas: "" },
  };
}
