import { beforeEach, describe, expect, it, vi } from "vitest";

function installStorage(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial));
  const ls = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
  vi.stubGlobal("window", { localStorage: ls });
  vi.stubGlobal("localStorage", ls);
  return m;
}

const load = async () => {
  vi.resetModules();
  return await import("@/lib/store");
};

describe("store — leitura defensiva", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("JSON corrompido ou de tipo errado volta para os dados iniciais", async () => {
    installStorage({ gabriel_nutri_patients_v1: "{nao-json", gabriel_nutri_consultations_v1: '{"a":1}', gabriel_nutri_financial_v1: "42" });
    const s = await load();
    expect(s.getStoredPatients().length).toBe(s.INITIAL_PATIENTS.length);
    expect(s.getStoredConsultations().length).toBe(s.INITIAL_CONSULTATIONS.length);
    expect(s.getStoredFinancial().length).toBe(s.INITIAL_FINANCIAL.length);
  });
  it("descarta itens sem id/nome e completa campos ausentes do paciente", async () => {
    installStorage({ gabriel_nutri_patients_v1: JSON.stringify([null, 5, { id: "x" }, { id: "p1", nome: "Maria" }]) });
    const s = await load();
    const [p] = s.getStoredPatients();
    expect(s.getStoredPatients()).toHaveLength(1);
    expect(p).toMatchObject({ id: "p1", nome: "Maria", restricoes: [], status: "ativo", genero: "F" });
    expect(p.dadosAntropometricos.peso).toBe(0);
    expect(p.planoAtivoId).toBe("plano-p1");
  });
  it("adesão e números do paciente ficam em faixa válida", async () => {
    installStorage({ gabriel_nutri_patients_v1: JSON.stringify([{ id: "p1", nome: "M", adesaoMedia7d: 900, idade: -3, streakDias: "x" }]) });
    const s = await load();
    const [p] = s.getStoredPatients();
    expect([p.adesaoMedia7d, p.idade, p.streakDias]).toEqual([100, 0, 0]);
  });
});

describe("store — perfil do plano por paciente", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("perfil salvo corrompido é sanitizado e não quebra", async () => {
    installStorage({ gabriel_nutri_profiles_v1_pac1: JSON.stringify({ versao: 2, meals: [{ id: 1, nome: "x" }], calorias: -9 }) });
    const s = await load();
    const p = s.getStoredPlanProfile("pac1");
    expect(p.meals[0].opcoes).toEqual([]);
    expect(p.calorias).toBe(0);
  });
  it("salvar e ler devolve o mesmo plano, isolado por paciente", async () => {
    installStorage();
    const s = await load();
    const base = s.getStoredPlanProfile("pac-ana-lima");
    expect(s.saveStoredPlanProfile("pac-ana-lima", { ...base, fase: "FASE-ANA" })).toBe(true);
    expect(s.getStoredPlanProfile("pac-ana-lima").fase).toBe("FASE-ANA");
    expect(s.getStoredPlanProfile("pac-carlos-mendes").fase).not.toBe("FASE-ANA");
  });
  it("saveStoredPlanProfile devolve false quando o armazenamento falha", async () => {
    const m = installStorage();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => {} });
    vi.stubGlobal("window", { localStorage });
    const s = await load();
    expect(s.saveStoredPlanProfile("x", s.getStoredPlanProfile("x"))).toBe(false);
    expect(m.size).toBe(0);
  });
  it("paciente novo (não demo) ganha plano vazio com restrições e dados do cadastro", async () => {
    installStorage({ gabriel_nutri_patients_v1: JSON.stringify([{ id: "novo", nome: "Nova Pessoa", genero: "F", objetivo: "Emagrecimento", idade: 30, restricoes: ["Intolerância à lactose", "Alergia a frutos do mar"], dadosAntropometricos: { peso: 60, altura: 165 } }]) });
    const s = await load();
    const p = s.getStoredPlanProfile("novo");
    expect(p.paciente).toBe("Nova Pessoa");
    expect(p.restricoes.tags).toEqual(expect.arrayContaining(["lactose", "frutosDoMar"]));
    expect(p.antropometria).toMatchObject({ peso: 60, altura: 165, idade: 30, sexo: "F", objetivo: "perda" });
    expect(p.meals.every((m) => m.opcoes.every((o) => o.itens.length === 0))).toBe(true);
  });
});

describe("store — token do portal", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("todo paciente recebe token longo, único e persistido", async () => {
    installStorage();
    const s = await load();
    const ps = s.getStoredPatients();
    const tokens = ps.map((p) => p.portalToken!);
    expect(tokens.every((t) => t && t.length >= 24)).toBe(true);
    expect(new Set(tokens).size).toBe(ps.length);
    expect(s.getStoredPatients().map((p) => p.portalToken)).toEqual(tokens);
  });
  it("token não é o id e não adivinha: só resolve o token exato", async () => {
    installStorage();
    const s = await load();
    const [p] = s.getStoredPatients();
    expect(p.portalToken).not.toBe(p.id);
    expect(s.getPatientByPortalToken(p.portalToken!)?.id).toBe(p.id);
    expect(s.getPatientByPortalToken(p.id)).toBeNull();
    expect(s.getPatientByPortalToken("qualquer-coisa")).toBeNull();
    expect(s.getPatientByPortalToken("")).toBeNull();
  });
  it("rota do plano resolve por id do paciente ou id do plano", async () => {
    installStorage();
    const s = await load();
    expect(s.getPatientForPlanRoute("pac-ana-lima")?.id).toBe("pac-ana-lima");
    expect(s.getPatientForPlanRoute("plano-ana-lima")?.id).toBe("pac-ana-lima");
    expect(s.getPatientForPlanRoute("nao-existe")).toBeNull();
  });
});
