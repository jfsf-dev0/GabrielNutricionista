import type { Food, MealItem, MealOption, PatientProfile } from "@/lib/types";

export const arroz: Food = { id: 1, nome: "Arroz, tipo 1, cozido", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 128, p: 2.5, c: 28.1, l: 0.2, fibras: 1.6, ferro: 0.1 } };
export const frango: Food = { id: 2, nome: "Frango, peito, sem pele, grelhado", grupo: "Carnes e derivados", origem: "TACO", n: { kcal: 159, p: 32, c: 0, l: 2.5 } };
export const batata: Food = { id: 3, nome: "Batata, inglesa, cozida", grupo: "Verduras, hortaliças e derivados", origem: "TACO", n: { kcal: 52, p: 1.2, c: 11.9, l: 0 } };
export const leite: Food = { id: 4, nome: "Leite, de vaca, integral", grupo: "Leite e derivados", origem: "TACO", n: { kcal: 61, p: 3.2, c: 4.6, l: 3.3 } };
export const macarrao: Food = { id: 5, nome: "Macarrão, trigo, cru", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 371, p: 10, c: 77.9, l: 1.3 } };
export const foods = [arroz, frango, batata, leite, macarrao];
export const byId = new Map(foods.map((f) => [f.id, f]));

export const item = (foodId: number | undefined, gramas: number, extra: Partial<MealItem> = {}): MealItem => ({
  id: `i${foodId}-${gramas}`, foodId, nome: foods.find((f) => f.id === foodId)?.nome ?? "livre", gramas, ...extra,
});

export const option = (itens: MealItem[], extra = { kcal: 0, p: 0, c: 0, l: 0 }): MealOption => ({
  id: "o", titulo: "Opção", itens, extra,
});

export const baseProfile = (over: Partial<PatientProfile> = {}): PatientProfile => ({
  id: "p1", versao: 2, atualizadoEm: "2026-01-01T00:00:00.000Z", paciente: "Teste", data: "hoje", fase: "", nutricionista: "N", crn: "", telefone: "", local: "",
  calorias: 2000, prot: 150, carbo: 200, gord: 60, fibras: 30, agua: "3 L",
  antropometria: {}, restricoes: { tags: [], termos: "" }, suplementos: [], meals: [],
  receita: { nome: "", rendimento: "", ingredientes: "", preparo: "" },
  micros: { modo: "auto", lipideos: "", minerais: "", vitaminas: "" },
  ...over,
});
