export const SCHEMA_VERSION = 2;

export type NutrientKey =
  | "kcal" | "p" | "c" | "l" | "fibras"
  | "colesterol" | "calcio" | "magnesio" | "fosforo" | "ferro" | "sodio"
  | "potassio" | "zinco" | "cobre" | "vitC" | "tiamina" | "riboflavina"
  | "piridoxina" | "niacina" | "retinol";

/** Valores por 100 g (alimento) ou totais (porção/opção). Chave ausente = não informado. */
export type Nutrients = Partial<Record<NutrientKey, number>>;

export interface Macros {
  kcal: number;
  p: number;
  c: number;
  l: number;
}

export interface Food {
  id: number;
  nome: string;
  grupo: string;
  origem: string;
  /** por 100 g */
  n: Nutrients;
}

export interface MealItem {
  id: string;
  /** Ausente = item sem vínculo com a base (texto livre; não entra no cálculo). */
  foodId?: number;
  nome: string;
  gramas: number;
  /** Medida caseira em texto livre, ex.: "1 col. sopa". */
  medida?: string;
  /** Linha de observação/substituição, sem quantidade. */
  nota?: boolean;
}

export interface MealOption {
  id: string;
  titulo: string;
  itens: MealItem[];
  /** Ajuste manual somado ao calculado (cobre itens sem vínculo). */
  extra: Macros;
}

export interface Meal {
  id: number;
  nome: string;
  horario: string;
  opcoes: MealOption[];
}

export interface Supplement {
  id: string;
  nome: string;
  posologia: string;
  obs: string;
}

export interface Recipe {
  nome: string;
  rendimento: string;
  ingredientes: string;
  preparo: string;
}

export type RestrictionKey =
  | "lactose" | "gluten" | "ovo" | "amendoim" | "oleaginosas"
  | "frutosDoMar" | "soja" | "vegetariano" | "vegano";

export interface Restrictions {
  tags: RestrictionKey[];
  /** Termos livres separados por vírgula; alimentos cujo nome contenha algum são sinalizados. */
  termos: string;
}

export type Sexo = "M" | "F";
export type Objetivo = "perda" | "manutencao" | "ganho";

export interface Antropometria {
  peso?: number;
  altura?: number;
  idade?: number;
  sexo?: Sexo;
  atividade?: number;
  objetivo?: Objetivo;
}

export interface MicrosTexto {
  /** auto = somado dos alimentos; manual = textos abaixo. */
  modo: "auto" | "manual";
  lipideos: string;
  minerais: string;
  vitaminas: string;
}

export interface PatientProfile {
  id: string;
  versao: number;
  atualizadoEm: string;
  paciente: string;
  data: string;
  fase: string;
  nutricionista: string;
  crn: string;
  telefone: string;
  local: string;
  calorias: number;
  prot: number;
  carbo: number;
  gord: number;
  fibras: number;
  agua: string;
  antropometria: Antropometria;
  restricoes: Restrictions;
  suplementos: Supplement[];
  meals: Meal[];
  receita: Recipe;
  micros: MicrosTexto;
}
