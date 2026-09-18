import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { searchFoods, violations } from "@/lib/foods";
import type { Food, RestrictionKey } from "@/lib/types";

const foods: Food[] = JSON.parse(readFileSync("public/foods.json", "utf8"));
const top = (q: string, n = 1) => searchFoods(foods, q, n).map((f) => f.nome);
const flags = (nome: string, tag: RestrictionKey) => {
  const f = foods.find((x) => x.nome === nome);
  if (!f) throw new Error(`alimento não encontrado: ${nome}`);
  return violations(f, { tags: [tag], termos: "" }).length > 0;
};

describe("busca na base real: o que o nutricionista espera achar primeiro", () => {
  it("prefere preparado a cru em cereais, carnes e ovos", () => {
    expect(top("arroz")[0]).toBe("Arroz, tipo 1, cozido");
    expect(top("ovo")[0]).toBe("Ovo, de galinha, inteiro, cozido/10minutos");
    expect(top("feijao")[0]).toMatch(/cozido/);
    expect(top("batata")[0]).toMatch(/cozida/);
  });
  it("frutas e verduras cruas continuam normais", () => {
    expect(top("banana")[0]).toBe("Banana, prata, crua");
    expect(top("alface")[0]).toMatch(/alface/i);
  });
  it("prefere o corte comum a vísceras e partes incomuns", () => {
    expect(top("frango grelhado")[0]).toBe("Frango, peito, sem pele, grelhado");
    expect(top("frango")[0]).toMatch(/peito/);
    expect(top("carne bovina grelhado")[0]).toMatch(/patinho|grelhad/i);
  });
  it("leite é o de vaca, não o de coco", () => {
    expect(top("leite")[0]).toMatch(/^Leite,? de vaca/i);
  });
  it("consulta que pede o cru ou a víscera ainda a encontra", () => {
    expect(top("arroz cru")[0]).toMatch(/cru/);
    expect(top("figado")[0]).toMatch(/[Ff]ígado/);
  });
  it("acha suplementos e produtos cadastrados", () => {
    expect(top("whey")[0]).toMatch(/^Whey/);
    expect(top("creatina")[0]).toBe("Creatina Monohidratada");
    expect(top("tilapia")[0]).toMatch(/Tilápia/);
  });
  it("tolera erro de digitação na base real", () => {
    expect(top("frnago")[0]).toMatch(/Frango/);
    expect(top("aroz cozido")[0]).toBe("Arroz, tipo 1, cozido");
  });
});

describe("restrições na base real", () => {
  it("lactose: leites vegetais e tofu não são sinalizados; laticínios de verdade sim", () => {
    expect(flags("Leite, de coco", "lactose")).toBe(false);
    expect(flags("Soja, queijo (tofu)", "lactose")).toBe(false);
    expect(flags("Queijo, minas, frescal", "lactose")).toBe(true);
    expect(flags("Iogurte, natural", "lactose")).toBe(true);
    expect(flags("Whey Protein Concentrado 80%", "lactose")).toBe(true);
  });
  it("glúten: pega salgados e cereais que levam trigo", () => {
    for (const n of ["Coxinha de frango, frita", "Nhoque, batata, cozido", "Cereal matinal, milho", "Farinha, láctea, de cereais"]) {
      expect(flags(n, "gluten"), n).toBe(true);
    }
    expect(flags("Arroz, tipo 1, cozido", "gluten")).toBe(false);
    expect(flags("Farinha, de mandioca, crua", "gluten")).toBe(false);
  });
  it("vegano: pega biscoitos, bolos e afins que levam ovo/leite", () => {
    for (const n of ["Biscoito, doce, maisena", "Bolo, pronto, chocolate", "Bolo, pronto, milho"]) expect(flags(n, "vegano"), n).toBe(true);
    expect(flags("Arroz, tipo 1, cozido", "vegano")).toBe(false);
    expect(flags("Feijão, carioca, cozido", "vegano")).toBe(false);
  });
  it("ovo: pega preparações que levam ovo", () => {
    expect(flags("Bolo, pronto, chocolate", "ovo")).toBe(true);
    expect(flags("Arroz, tipo 1, cozido", "ovo")).toBe(false);
  });
});

describe("dados da base", () => {
  it("ids únicos e todo item tem kcal", () => {
    expect(new Set(foods.map((f) => f.id)).size).toBe(foods.length);
    expect(foods.every((f) => typeof f.n.kcal === "number")).toBe(true);
  });
  it("medidas caseiras têm nome e gramas positivas", () => {
    const comMedidas = foods.filter((f) => f.medidas);
    expect(comMedidas.length).toBeGreaterThanOrEqual(30);
    for (const f of comMedidas) for (const m of f.medidas!) expect(m.gramas > 0 && m.nome.length > 0, `${f.nome}: ${m.nome}`).toBe(true);
    expect(foods.find((f) => f.nome === "Frango, peito, sem pele, grelhado")?.medidas?.some((m) => m.gramas === 120)).toBe(true);
  });
});
