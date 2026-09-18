export interface MealOption {
  titulo: string;
  cal: number;
  p: number;
  c: number;
  l: number;
  itens: string[];
}

export interface Meal {
  id: number;
  nome: string;
  horario: string;
  optA: MealOption;
  optB: MealOption;
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

export interface PatientProfile {
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
  suplementos: Supplement[];
  meals: Record<number, Meal>;
  receita: Recipe;
  lipideosStr: string;
  mineraisStr: string;
  vitaminasStr: string;
}
