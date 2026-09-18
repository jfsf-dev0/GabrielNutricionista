import { clampNum } from "./limits";
import type { AnthropometricData, Consultation, DiaryEntry, FinancialItem, Patient, PatientGoal, PatientStatus } from "./types";

const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fb = ""): string => (typeof v === "string" ? v.slice(0, 5000) : fb);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 500)) : []);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], fb: T): T => (opts.includes(v as T) ? (v as T) : fb);

const GOALS = ["Hipertrofia", "Emagrecimento", "Performance", "Saúde & Longevidade", "Recomposição Corporal"] as const;
const STATUS = ["ativo", "alerta", "inativo"] as const;

function sanitizeAnthropometric(raw: unknown): AnthropometricData {
  const o = isObj(raw) ? raw : {};
  const n = (v: unknown, max: number) => clampNum(v, 0, max);
  const out: AnthropometricData = {
    peso: n(o.peso, 500), altura: n(o.altura, 260), imc: n(o.imc, 100), tmb: n(o.tmb, 10000), get: n(o.get, 20000),
    percentualGordura: n(o.percentualGordura, 100), massaMagraKg: n(o.massaMagraKg, 500), massaGordaKg: n(o.massaGordaKg, 500),
  };
  for (const k of ["circunferencias", "dobras"] as const) {
    if (isObj(o[k])) {
      const sub: Record<string, number> = {};
      for (const [kk, vv] of Object.entries(o[k])) sub[kk] = clampNum(vv, 0, 500);
      (out as any)[k] = sub;
    }
  }
  return out;
}

export function sanitizePatient(raw: unknown): Patient | null {
  if (!isObj(raw) || typeof raw.id !== "string" || !raw.id || typeof raw.nome !== "string") return null;
  const p: Patient = {
    id: raw.id,
    nome: str(raw.nome),
    email: str(raw.email),
    telefone: str(raw.telefone),
    dataNascimento: str(raw.dataNascimento),
    idade: clampNum(raw.idade, 0, 120),
    genero: raw.genero === "M" ? "M" : "F",
    objetivo: oneOf<PatientGoal>(raw.objetivo, GOALS, "Saúde & Longevidade"),
    status: oneOf<PatientStatus>(raw.status, STATUS, "ativo"),
    restricoes: strList(raw.restricoes),
    dadosAntropometricos: sanitizeAnthropometric(raw.dadosAntropometricos),
    planoAtivoId: str(raw.planoAtivoId) || `plano-${raw.id}`,
    ultimaConsulta: str(raw.ultimaConsulta),
    adesaoMedia7d: clampNum(raw.adesaoMedia7d, 0, 100),
    streakDias: clampNum(raw.streakDias, 0, 10000),
    notasClinicas: str(raw.notasClinicas),
  };
  if (typeof raw.statusMotivo === "string") p.statusMotivo = str(raw.statusMotivo);
  if (Array.isArray(raw.patologias)) p.patologias = strList(raw.patologias);
  if (Array.isArray(raw.medicamentos)) p.medicamentos = strList(raw.medicamentos);
  if (typeof raw.proximaConsulta === "string") p.proximaConsulta = str(raw.proximaConsulta);
  if (typeof raw.portalToken === "string" && raw.portalToken.length >= 16) p.portalToken = raw.portalToken.slice(0, 200);
  if (isObj(raw.anamnese)) {
    const a = raw.anamnese;
    p.anamnese = { sono: str(a.sono), aguaLitrosDia: clampNum(a.aguaLitrosDia, 0, 20), intestino: str(a.intestino), atividadeFisica: str(a.atividadeFisica), alcoolFumo: str(a.alcoolFumo) };
  }
  return p;
}

export function sanitizeConsultation(raw: unknown): Consultation | null {
  if (!isObj(raw) || typeof raw.id !== "string" || typeof raw.pacienteId !== "string") return null;
  const c: Consultation = {
    id: raw.id,
    pacienteId: raw.pacienteId,
    pacienteNome: str(raw.pacienteNome),
    dataHora: str(raw.dataHora),
    horario: str(raw.horario),
    duracaoMinutos: clampNum(raw.duracaoMinutos, 1, 600, 30),
    status: oneOf(raw.status, ["agendada", "em_andamento", "realizada", "cancelada"] as const, "agendada"),
    tipo: raw.tipo === "online" ? "online" : "presencial",
  };
  for (const k of ["queixaPrincipal", "conduta", "notas"] as const) if (typeof raw[k] === "string") c[k] = str(raw[k]);
  if (raw.pesoAferido !== undefined) c.pesoAferido = clampNum(raw.pesoAferido, 0, 500);
  return c;
}

export function sanitizeDiaryEntry(raw: unknown): DiaryEntry | null {
  if (!isObj(raw) || typeof raw.id !== "string" || typeof raw.pacienteId !== "string") return null;
  const d: DiaryEntry = {
    id: raw.id,
    pacienteId: raw.pacienteId,
    data: str(raw.data),
    refeicaoId: clampNum(raw.refeicaoId, 0, 1000),
    refeicaoNome: str(raw.refeicaoNome),
    status: oneOf(raw.status, ["cumprida", "adaptada", "pulada"] as const, "cumprida"),
    opcaoEscolhida: str(raw.opcaoEscolhida, "A").slice(0, 2) || "A",
    aguaConsumidaMl: clampNum(raw.aguaConsumidaMl, 0, 20000),
    avaliacaoEstrelas: clampNum(raw.avaliacaoEstrelas, 0, 5),
  };
  if (typeof raw.notas === "string") d.notas = str(raw.notas);
  if (typeof raw.fotoUrl === "string" && /^(data:image\/|blob:)/.test(raw.fotoUrl)) d.fotoUrl = raw.fotoUrl;
  return d;
}

export function sanitizeFinancialItem(raw: unknown): FinancialItem | null {
  if (!isObj(raw) || typeof raw.id !== "string" || typeof raw.pacienteId !== "string") return null;
  const f: FinancialItem = {
    id: raw.id,
    pacienteId: raw.pacienteId,
    pacienteNome: str(raw.pacienteNome),
    descricao: str(raw.descricao),
    valor: clampNum(raw.valor, 0, 1e7),
    dataVencimento: str(raw.dataVencimento),
    status: oneOf(raw.status, ["pago", "pendente", "atrasado"] as const, "pendente"),
    metodo: oneOf(raw.metodo, ["PIX", "Cartão de Crédito", "Boleto"] as const, "PIX"),
  };
  if (typeof raw.dataPagamento === "string") f.dataPagamento = str(raw.dataPagamento);
  return f;
}
