import { describe, expect, it } from "vitest";
import { byId, item, option, baseProfile } from "./fixtures";
import { validatePlan } from "@/lib/validate";

const meal = (id: number, opcoes: any[]) => ({ id, nome: `R${id}`, horario: "", opcoes });
const msgs = (p: any) => validatePlan(p, byId).map((i) => `${i.nivel}:${i.codigo}`);

describe("validatePlan", () => {
  it("exige nome do paciente e ao menos uma refeição preenchida", () => {
    const m = msgs(baseProfile({ paciente: " ", meals: [] }));
    expect(m).toContain("erro:paciente");
    expect(m).toContain("erro:sem-refeicoes");
  });
  it("avisa refeição sem nenhuma opção preenchida", () => {
    const p = baseProfile({ meals: [meal(1, [option([item(1, 100)])]), meal(2, [option([])])] });
    expect(msgs(p)).toContain("aviso:refeicao-vazia");
  });
  it("classifica desvio da meta: <5% ok, 5–10% aviso, >10% erro", () => {
    // meta 2000 kcal
    const com = (g: number) => baseProfile({ prot: 0, carbo: 0, gord: 0, meals: [meal(1, [option([item(1, g)])])] });
    // arroz 128 kcal/100 g → 1562 g ≈ 2000 kcal
    expect(msgs(com(1562)).some((c) => c.endsWith(":desvio-kcal"))).toBe(false);
    expect(msgs(com(1440))).toContain("aviso:desvio-kcal"); // ~ -7,8%
    expect(msgs(com(1000))).toContain("erro:desvio-kcal"); // -36%
  });
  it("sinaliza alimentos que violam restrições do paciente", () => {
    const p = baseProfile({
      restricoes: { tags: ["lactose"], termos: "" },
      meals: [meal(1, [option([item(4, 200)])])],
    });
    expect(msgs(p)).toContain("aviso:restricao");
  });
  it("avisa itens sem vínculo que não entram no cálculo (sem ajuste manual)", () => {
    const p = baseProfile({ meals: [meal(1, [option([item(undefined, 80)])])] });
    expect(msgs(p)).toContain("aviso:sem-vinculo");
    const ok = baseProfile({ meals: [meal(1, [option([item(undefined, 80)], { kcal: 300, p: 0, c: 0, l: 0 })])] });
    expect(msgs(ok)).not.toContain("aviso:sem-vinculo");
  });
  it("plano coerente não gera erros", () => {
    const p = baseProfile({ prot: 0, carbo: 0, gord: 0, meals: [meal(1, [option([item(1, 1562)])])] });
    expect(validatePlan(p, byId).filter((i) => i.nivel === "erro")).toEqual([]);
  });
});
