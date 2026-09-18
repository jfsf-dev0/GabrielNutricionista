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
  id?: string;
  titulo: string;
  cal?: number;
  p?: number;
  c?: number;
  l?: number;
  itens: MealItem[];
  /** Ajuste manual somado ao calculado (cobre itens sem vínculo). */
  extra?: Macros;
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

export interface Micronutrients {
  lipideosStr: string;
  mineraisStr: string;
  vitaminasStr: string;
}

export interface PatientProfile {
  id?: string;
  versao?: number;
  atualizadoEm?: string;
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
  antropometria?: Antropometria;
  restricoes?: Restrictions;
  suplementos: Supplement[];
  meals: Meal[];
  receita: Recipe;
  micros?: MicrosTexto;
  lipideosStr?: string;
  mineraisStr?: string;
  vitaminasStr?: string;
}

export type PatientStatus = "ativo" | "alerta" | "inativo";
export type PatientGoal = "Hipertrofia" | "Emagrecimento" | "Performance" | "Saúde & Longevidade" | "Recomposição Corporal";

export interface AnthropometricData {
  peso: number; // kg
  altura: number; // cm
  imc: number;
  tmb: number; // kcal
  get: number; // kcal
  percentualGordura: number; // %
  massaMagraKg: number;
  massaGordaKg: number;
  circunferencias?: {
    cintura?: number;
    abdome?: number;
    quadril?: number;
    bracoRelaxado?: number;
    bracoContraido?: number;
    coxa?: number;
  };
  dobras?: {
    triceps?: number;
    subescapular?: number;
    suprailiaca?: number;
    abdominal?: number;
    coxa?: number;
    peitoral?: number;
    axilarMedia?: number;
  };
}

export interface ClinicalHistoryItem {
  id: string;
  data: string;
  tipo: "consulta" | "anamnese" | "retorno" | "exame" | "intercorrencia";
  titulo: string;
  descricao: string;
  conduta?: string;
}

export interface Patient {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  genero: "M" | "F";
  objetivo: PatientGoal;
  status: PatientStatus;
  statusMotivo?: string;
  restricoes: string[]; // ex: "Intolerância à lactose", "Alergia a frutos do mar"
  patologias?: string[]; // ex: "Hipertensão leve", "Gastrite"
  medicamentos?: string[];
  dadosAntropometricos: AnthropometricData;
  planoAtivoId: string;
  ultimaConsulta: string;
  proximaConsulta?: string;
  adesaoMedia7d: number; // 0-100%
  streakDias: number;
  notasClinicas: string;
  anamnese?: {
    sono: string;
    aguaLitrosDia: number;
    intestino: string;
    atividadeFisica: string;
    alcoolFumo: string;
  };
}

export interface Consultation {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  dataHora: string;
  horario: string;
  duracaoMinutos: number;
  status: "agendada" | "em_andamento" | "realizada" | "cancelada";
  tipo: "presencial" | "online";
  queixaPrincipal?: string;
  pesoAferido?: number;
  conduta?: string;
  notas?: string;
}

export interface FoodItemTACO {
  id: string;
  nome: string;
  categoria: "Carnes & Ovos" | "Cereais & Leguminosas" | "Frutas & Sucos" | "Laticínios" | "Gorduras & Óleos" | "Verduras & Legumes" | "Suplementos";
  porcaoPadraoGramas: number; // 100g base
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  medidasCaseiras: {
    descricao: string;
    gramas: number;
  }[];
}

export interface DiaryEntry {
  id: string;
  pacienteId: string;
  data: string;
  refeicaoId: number;
  refeicaoNome: string;
  status: "cumprida" | "adaptada" | "pulada";
  opcaoEscolhida: "A" | "B";
  aguaConsumidaMl: number;
  fotoUrl?: string;
  avaliacaoEstrelas: number; // 1-5
  notas?: string;
}

export interface ExamRecord {
  id: string;
  pacienteId: string;
  data: string;
  laboratorio: string;
  biomarcadores: {
    nome: string;
    valor: number | string;
    unidade: string;
    referencia: string;
    status: "normal" | "alerta" | "critico";
  }[];
}

export interface FinancialItem {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: "pago" | "pendente" | "atrasado";
  metodo: "PIX" | "Cartão de Crédito" | "Boleto";
}

export interface PractitionerProfile {
  nome: string;
  titulo: string;
  crn: string;
  telefone: string;
  email: string;
  clinica: string;
  endereco: string;
  cidade: string;
}
