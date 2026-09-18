import { describe, expect, it } from "vitest";
import { arroz, frango, byId, item, option, baseProfile } from "./fixtures";
import { scaleNutrients, optionTotals, dayTotals, goalBalance, calcGoals, macroPercents } from "@/lib/nutrition";

describe("scaleNutrients", () => {
  it("escala valores por 100 g para a porção sem arredondar", () => {
    const r = scaleNutrients(arroz.n, 150);
    expect(r.kcal).toBeCloseTo(192, 5);
    expect(r.p).toBeCloseTo(3.75, 5);
  });
  it("mantém chaves ausentes ausentes", () => {
    expect(scaleNutrients(frango.n, 100).fibras).toBeUndefined();
  });
});

describe("optionTotals", () => {
  it("soma itens vinculados", () => {
    const t = optionTotals(option([item(1, 100), item(2, 100)]), byId);
    expect(t.macros.kcal).toBeCloseTo(287, 5);
    expect(t.macros.p).toBeCloseTo(34.5, 5);
  });
  it("soma o ajuste manual aos itens", () => {
    const t = optionTotals(option([item(1, 100)], { kcal: 100, p: 5, c: 0, l: 2 }), byId);
    expect(t.macros).toEqual({ kcal: 228, p: 7.5, c: 28.1, l: 2.2 });
    expect(t.n.kcal).toBeCloseTo(228, 5);
  });
  it("ignora item sem vínculo, nota e alimento inexistente", () => {
    const t = optionTotals(option([item(undefined, 50), item(1, 0, { nota: true }), item(999, 100)]), byId);
    expect(t.macros.kcal).toBe(0);
  });
});

describe("dayTotals", () => {
  const meal = (id: number, opcoes: ReturnType<typeof option>[]) => ({ id, nome: `R${id}`, horario: "", opcoes });
  it("usa a média das opções por refeição e informa mínimo e máximo", () => {
    const p = baseProfile({
      meals: [meal(1, [option([item(1, 100)]), option([item(2, 100)])]), meal(2, [option([item(1, 200)])])],
    });
    const d = dayTotals(p, byId);
    expect(d.media.kcal).toBeCloseTo((128 + 159) / 2 + 256, 5);
    expect(d.min.kcal).toBeCloseTo(128 + 256, 5);
    expect(d.max.kcal).toBeCloseTo(159 + 256, 5);
  });
  it("ignora opções vazias na média", () => {
    const p = baseProfile({ meals: [meal(1, [option([item(1, 100)]), option([])])] });
    expect(dayTotals(p, byId).media.kcal).toBeCloseTo(128, 5);
  });
  it("plano sem refeições zera tudo", () => {
    expect(dayTotals(baseProfile(), byId).media.kcal).toBe(0);
  });
});

describe("goalBalance", () => {
  it("calcula saldo e desvio percentual por macro", () => {
    const p = baseProfile({ calorias: 2000, prot: 150, carbo: 200, gord: 60 });
    const b = goalBalance(p, { kcal: 1800, p: 165, c: 200, l: 60 });
    expect(b.kcal).toEqual({ meta: 2000, planejado: 1800, saldo: 200, desvioPct: -10 });
    expect(b.p.saldo).toBe(-15);
    expect(b.p.desvioPct).toBeCloseTo(10, 5);
    expect(b.c.desvioPct).toBe(0);
  });
  it("meta zero não gera divisão por zero", () => {
    const b = goalBalance(baseProfile({ calorias: 0 }), { kcal: 100, p: 0, c: 0, l: 0 });
    expect(b.kcal.desvioPct).toBe(0);
  });
});

describe("macroPercents", () => {
  it("distribui as kcal de macros (4/4/9)", () => {
    const r = macroPercents({ kcal: 2000, p: 150, c: 200, l: 60 });
    expect(r.p).toBe(30);
    expect(r.c).toBe(40);
    expect(r.l).toBe(27);
  });
  it("kcal zero devolve zeros", () => {
    expect(macroPercents({ kcal: 0, p: 10, c: 10, l: 10 })).toEqual({ p: 0, c: 0, l: 0 });
  });
});

describe("calcGoals (Mifflin-St Jeor)", () => {
  it("homem 80 kg, 180 cm, 30 anos, fator 1,55, manutenção", () => {
    const g = calcGoals({ peso: 80, altura: 180, idade: 30, sexo: "M", atividade: 1.55, objetivo: "manutencao" })!;
    expect(g.kcal).toBe(Math.round((10 * 80 + 6.25 * 180 - 5 * 30 + 5) * 1.55));
    expect(g.p).toBe(Math.round(80 * 1.8));
    expect(g.l).toBe(80);
    // carboidrato fecha o restante das kcal
    expect(Math.abs(g.p * 4 + g.c * 4 + g.l * 9 - g.kcal)).toBeLessThan(6);
  });
  it("mulher usa -161 e perda reduz 20%", () => {
    const m = calcGoals({ peso: 60, altura: 165, idade: 28, sexo: "F", atividade: 1.375, objetivo: "manutencao" })!;
    const l = calcGoals({ peso: 60, altura: 165, idade: 28, sexo: "F", atividade: 1.375, objetivo: "perda" })!;
    expect(m.kcal).toBe(Math.round((10 * 60 + 6.25 * 165 - 5 * 28 - 161) * 1.375));
    expect(l.kcal).toBe(Math.round(m.kcal * 0.8));
  });
  it("dados incompletos devolvem null", () => {
    expect(calcGoals({ peso: 80 })).toBeNull();
  });
  it("carboidrato nunca fica negativo", () => {
    const g = calcGoals({ peso: 200, altura: 150, idade: 80, sexo: "F", atividade: 1.2, objetivo: "perda" })!;
    expect(g.c).toBeGreaterThanOrEqual(0);
  });
});

import { hydrationGoalMl } from "@/lib/nutrition";

describe("hydrationGoalMl", () => {
  it("interpreta ml/kg com o peso do paciente", () => {
    expect(hydrationGoalMl("35 ml/kg/dia", 80)).toBe(2800);
    expect(hydrationGoalMl("40ml/kg", 60)).toBe(2400);
  });
  it("interpreta litros e faixas (usa o menor valor)", () => {
    expect(hydrationGoalMl("3,0L a 3,8L / dia", 70)).toBe(3000);
    expect(hydrationGoalMl("2 litros", 70)).toBe(2000);
  });
  it("sem dado utilizável devolve o padrão de 2.000 ml", () => {
    expect(hydrationGoalMl("", 70)).toBe(2000);
    expect(hydrationGoalMl("beber bastante", 70)).toBe(2000);
    expect(hydrationGoalMl("35 ml/kg", 0)).toBe(2000);
  });
  it("resultado sempre dentro de 500–8000 ml", () => {
    expect(hydrationGoalMl("100 ml/kg", 200)).toBe(8000);
    expect(hydrationGoalMl("0,1 L", 70)).toBe(500);
  });
});
