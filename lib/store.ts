import { Patient, Consultation, PatientProfile, DiaryEntry, FinancialItem, PractitionerProfile } from "./types";
import { defaultProfile } from "./defaultProfile";

export const PRACTITIONER_GABRIEL: PractitionerProfile = {
  nome: "Gabriel Alves",
  titulo: "Nutricionista Clínico & Esportivo",
  crn: "CRN-3: 81965/P",
  telefone: "(11) 98765-4321",
  email: "contato@gabrielnutri.com.br",
  clinica: "Consultoria Gabriel Alves · Nutrição de Alta Performance",
  endereco: "Av. Brigadeiro Faria Lima, 3477, Itaim Bibi",
  cidade: "São Paulo - SP",
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pac-joao-freire",
    nome: "João Freire",
    email: "joao.freire@exemplo.com",
    telefone: "(11) 99123-4567",
    dataNascimento: "1997-04-12",
    idade: 29,
    genero: "M",
    objetivo: "Hipertrofia",
    status: "ativo",
    restricoes: ["Sem restrições severas", "Prefere refeições práticas"],
    patologias: ["Nenhuma patologia crônica"],
    medicamentos: ["Nenhum"],
    dadosAntropometricos: {
      peso: 76.5,
      altura: 178,
      imc: 24.1,
      tmb: 1780,
      get: 2650,
      percentualGordura: 13.8,
      massaMagraKg: 65.9,
      massaGordaKg: 10.6,
      circunferencias: {
        cintura: 78.5,
        abdome: 81.0,
        quadril: 98.0,
        bracoContraido: 38.5,
        coxa: 58.0,
      },
      dobras: {
        peitoral: 7.0,
        abdominal: 14.0,
        coxa: 11.0,
        triceps: 8.0,
        subescapular: 11.0,
        suprailiaca: 9.5,
        axilarMedia: 8.0,
      },
    },
    planoAtivoId: "plano-joao-freire",
    ultimaConsulta: "18/09/2026",
    proximaConsulta: "18/10/2026",
    adesaoMedia7d: 92,
    streakDias: 14,
    notasClinicas:
      "Paciente em fase de hipertrofia controlada e recomposição. Boa resposta ao fracionamento proteico (2.2g/kg). Aderência excelente à suplementação de Creatina e hidratação de 2.7L/dia.",
    anamnese: {
      sono: "7h a 8h por noite, sono reparador",
      aguaLitrosDia: 2.7,
      intestino: "Regular, escala Bristol tipo 3-4",
      atividadeFisica: "Musculação 5x/semana + Cardio moderado 2x",
      alcoolFumo: "Álcool esporádico (fins de semana, baixa qtde), não fumante",
    },
  },
  {
    id: "pac-ana-lima",
    nome: "Ana Clara Lima",
    email: "ana.clara@exemplo.com",
    telefone: "(11) 98456-7890",
    dataNascimento: "1994-08-23",
    idade: 32,
    genero: "F",
    objetivo: "Emagrecimento",
    status: "alerta",
    statusMotivo: "5 dias sem registro no diário / queda de adesão",
    restricoes: ["Intolerância à lactose moderada"],
    patologias: ["Histórico familiar de hipotireoidismo"],
    dadosAntropometricos: {
      peso: 61.2,
      altura: 164,
      imc: 22.8,
      tmb: 1390,
      get: 1980,
      percentualGordura: 24.5,
      massaMagraKg: 46.2,
      massaGordaKg: 15.0,
      circunferencias: {
        cintura: 70.0,
        abdome: 76.0,
        quadril: 96.5,
        coxa: 54.0,
      },
      dobras: {
        triceps: 15.0,
        suprailiaca: 17.0,
        coxa: 20.0,
      },
    },
    planoAtivoId: "plano-ana-lima",
    ultimaConsulta: "28/08/2026",
    proximaConsulta: "28/09/2026",
    adesaoMedia7d: 64,
    streakDias: 1,
    notasClinicas:
      "Paciente relatou aumento na rotina de trabalho e dificuldade de realizar o lanche intermediário da tarde. Ajustar estratégias de praticidade na próxima consulta.",
    anamnese: {
      sono: "6h por noite, acorda cansada",
      aguaLitrosDia: 1.5,
      intestino: "Constipação leve ocasional",
      atividadeFisica: "Pilates 2x/semana + Musculação 2x",
      alcoolFumo: "Não fuma, consome vinho 2 taças/semana",
    },
  },
  {
    id: "pac-carlos-mendes",
    nome: "Carlos Mendes",
    email: "carlos.mendes@exemplo.com",
    telefone: "(11) 97112-3344",
    dataNascimento: "1985-02-15",
    idade: 41,
    genero: "M",
    objetivo: "Saúde & Longevidade",
    status: "ativo",
    restricoes: ["Redução de sódio e gorduras saturadas"],
    patologias: ["Hipertensão arterial estágio 1 controlada"],
    medicamentos: ["Losartana 50mg"],
    dadosAntropometricos: {
      peso: 88.0,
      altura: 175,
      imc: 28.7,
      tmb: 1720,
      get: 2350,
      percentualGordura: 26.2,
      massaMagraKg: 64.9,
      massaGordaKg: 23.1,
      circunferencias: {
        cintura: 94.0,
        abdome: 98.5,
        quadril: 104.0,
      },
    },
    planoAtivoId: "plano-carlos-mendes",
    ultimaConsulta: "15/08/2026",
    proximaConsulta: "18/09/2026", // Hoje às 15:30
    adesaoMedia7d: 88,
    streakDias: 9,
    notasClinicas:
      "Acompanhamento cardiovascular conjunto com cardiologista. Pressão estabilizada em 12/8. Retorno hoje para reavaliação de bioimpedância e exames laboratoriais.",
    anamnese: {
      sono: "7h por noite",
      aguaLitrosDia: 2.2,
      intestino: "Diário normal",
      atividadeFisica: "Caminhada rápida 4x/semana + Musculação 3x",
      alcoolFumo: "Não fuma, cerveja 1x a cada 15 dias",
    },
  },
  {
    id: "pac-beatriz-souza",
    nome: "Beatriz Souza",
    email: "beatriz.souza@exemplo.com",
    telefone: "(11) 96333-8899",
    dataNascimento: "2002-11-05",
    idade: 24,
    genero: "F",
    objetivo: "Performance",
    status: "ativo",
    restricoes: ["Sem restrições alimentares"],
    patologias: ["Nenhuma"],
    dadosAntropometricos: {
      peso: 55.0,
      altura: 168,
      imc: 19.5,
      tmb: 1350,
      get: 2400,
      percentualGordura: 16.5,
      massaMagraKg: 45.9,
      massaGordaKg: 9.1,
      circunferencias: {
        cintura: 64.0,
        abdome: 68.0,
        quadril: 92.0,
        coxa: 52.5,
      },
    },
    planoAtivoId: "plano-beatriz-souza",
    ultimaConsulta: "19/08/2026",
    proximaConsulta: "19/09/2026",
    adesaoMedia7d: 96,
    streakDias: 21,
    notasClinicas:
      "Atleta de Crossfit competitivo. Necessidade de periodização de carboidratos em dias de treino duplo. Excelente recuperação com suplementação de Beta-Alanina e Creatina.",
    anamnese: {
      sono: "8h a 9h rigoroso",
      aguaLitrosDia: 3.2,
      intestino: "Excelente",
      atividadeFisica: "Crossfit de alto rendimento 6x/semana",
      alcoolFumo: "Não consome álcool, não fuma",
    },
  },
];

export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: "cons-1",
    pacienteId: "pac-joao-freire",
    pacienteNome: "João Freire",
    dataHora: "2026-09-18T10:00:00",
    horario: "10:00",
    duracaoMinutos: 60,
    status: "realizada",
    tipo: "presencial",
    queixaPrincipal: "Evolução do protocolo de hipertrofia e ajuste de calorias para 2.268 kcal.",
    pesoAferido: 76.5,
    conduta: "Manutenção do superávit leve com alta densidade proteica (171.6g). Dossiê A4 gerado.",
  },
  {
    id: "cons-2",
    pacienteId: "pac-carlos-mendes",
    pacienteNome: "Carlos Mendes",
    dataHora: "2026-09-18T15:30:00",
    horario: "15:30",
    duracaoMinutos: 50,
    status: "agendada",
    tipo: "presencial",
    queixaPrincipal: "Retorno mensal para bioimpedância e revisão do perfil lipídico.",
  },
  {
    id: "cons-3",
    pacienteId: "pac-ana-lima",
    pacienteNome: "Ana Clara Lima",
    dataHora: "2026-09-18T17:00:00",
    horario: "17:00",
    duracaoMinutos: 45,
    status: "agendada",
    tipo: "online",
    queixaPrincipal: "Alinhamento de rotina e adaptação dos lanches para viagens a trabalho.",
  },
  {
    id: "cons-4",
    pacienteId: "pac-beatriz-souza",
    pacienteNome: "Beatriz Souza",
    dataHora: "2026-09-19T09:00:00",
    horario: "09:00",
    duracaoMinutos: 60,
    status: "agendada",
    tipo: "presencial",
    queixaPrincipal: "Periodização para campeonato de Crossfit no próximo mês.",
  },
];

export const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: "diary-1",
    pacienteId: "pac-joao-freire",
    data: "2026-09-18",
    refeicaoId: 1,
    refeicaoNome: "Desjejum / Pré-Treino",
    status: "cumprida",
    opcaoEscolhida: "A",
    aguaConsumidaMl: 500,
    avaliacaoEstrelas: 5,
    notas: "Excelente energia no treino de peito e tríceps.",
  },
  {
    id: "diary-2",
    pacienteId: "pac-joao-freire",
    data: "2026-09-18",
    refeicaoId: 2,
    refeicaoNome: "Almoço",
    status: "cumprida",
    opcaoEscolhida: "A",
    aguaConsumidaMl: 1000,
    avaliacaoEstrelas: 5,
    notas: "150g de frango + 150g arroz + feijão e salada verde.",
  },
  {
    id: "diary-3",
    pacienteId: "pac-joao-freire",
    data: "2026-09-18",
    refeicaoId: 3,
    refeicaoNome: "Lanche da Tarde",
    status: "cumprida",
    opcaoEscolhida: "B",
    aguaConsumidaMl: 1800,
    avaliacaoEstrelas: 4,
    notas: "Optei pelo Iogurte desnatado com morangos e Whey de chocolate.",
  },
];

export const INITIAL_FINANCIAL: FinancialItem[] = [
  {
    id: "fin-1",
    pacienteId: "pac-joao-freire",
    pacienteNome: "João Freire",
    descricao: "Consultoria Premium Semestral (Parcela 3/6)",
    valor: 450.0,
    dataVencimento: "2026-09-10",
    dataPagamento: "2026-09-08",
    status: "pago",
    metodo: "PIX",
  },
  {
    id: "fin-2",
    pacienteId: "pac-carlos-mendes",
    pacienteNome: "Carlos Mendes",
    descricao: "Consulta Avulsa + Avaliação Física",
    valor: 380.0,
    dataVencimento: "2026-09-18",
    status: "pendente",
    metodo: "PIX",
  },
  {
    id: "fin-3",
    pacienteId: "pac-ana-lima",
    pacienteNome: "Ana Clara Lima",
    descricao: "Plano Trimestral Acompanhamento Online",
    valor: 320.0,
    dataVencimento: "2026-09-25",
    status: "pendente",
    metodo: "Cartão de Crédito",
  },
  {
    id: "fin-4",
    pacienteId: "pac-beatriz-souza",
    pacienteNome: "Beatriz Souza",
    descricao: "Protocolo Atleta Alto Rendimento",
    valor: 500.0,
    dataVencimento: "2026-09-05",
    dataPagamento: "2026-09-05",
    status: "pago",
    metodo: "PIX",
  },
];

// In-Memory & LocalStorage Storage Provider
const STORAGE_KEYS = {
  PATIENTS: "gabriel_nutri_patients_v1",
  CONSULTATIONS: "gabriel_nutri_consultations_v1",
  PROFILES: "gabriel_nutri_profiles_v1",
  DIARY: "gabriel_nutri_diary_v1",
  FINANCIAL: "gabriel_nutri_financial_v1",
};

export function getStoredPatients(): Patient[] {
  if (typeof window === "undefined") return INITIAL_PATIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return raw ? JSON.parse(raw) : INITIAL_PATIENTS;
  } catch (e) {
    return INITIAL_PATIENTS;
  }
}

export function saveStoredPatients(patients: Patient[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (e) {
    console.error("Failed to save patients", e);
  }
}

export function getStoredConsultations(): Consultation[] {
  if (typeof window === "undefined") return INITIAL_CONSULTATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
    return raw ? JSON.parse(raw) : INITIAL_CONSULTATIONS;
  } catch (e) {
    return INITIAL_CONSULTATIONS;
  }
}

export function saveStoredConsultations(consultations: Consultation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
  } catch (e) {
    console.error("Failed to save consultations", e);
  }
}

export function getStoredPlanProfile(patientId: string): PatientProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PROFILES}_${patientId}`);
    if (raw) return JSON.parse(raw);
    if (patientId === "pac-joao-freire") return defaultProfile;
    // Fallback for others: clone default with name
    const patients = getStoredPatients();
    const p = patients.find((x) => x.id === patientId);
    if (p) {
      return {
        ...defaultProfile,
        paciente: p.nome,
        calorias: p.dadosAntropometricos.tmb + 400,
        data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
      };
    }
    return defaultProfile;
  } catch (e) {
    return defaultProfile;
  }
}

export function saveStoredPlanProfile(patientId: string, profile: PatientProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEYS.PROFILES}_${patientId}`, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export function getStoredDiary(patientId: string): DiaryEntry[] {
  if (typeof window === "undefined") return INITIAL_DIARY.filter((d) => d.pacienteId === patientId);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    const all: DiaryEntry[] = raw ? JSON.parse(raw) : INITIAL_DIARY;
    return all.filter((d) => d.pacienteId === patientId);
  } catch (e) {
    return INITIAL_DIARY.filter((d) => d.pacienteId === patientId);
  }
}

export function addStoredDiaryEntry(entry: DiaryEntry) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    const all: DiaryEntry[] = raw ? JSON.parse(raw) : INITIAL_DIARY;
    all.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to add diary entry", e);
  }
}

export function getStoredFinancial(): FinancialItem[] {
  if (typeof window === "undefined") return INITIAL_FINANCIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
    return raw ? JSON.parse(raw) : INITIAL_FINANCIAL;
  } catch (e) {
    return INITIAL_FINANCIAL;
  }
}
