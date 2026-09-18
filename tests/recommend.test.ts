import { describe, expect, it } from "vitest";
import { foods, arroz, batata, macarrao, item } from "./fixtures";
import { suggestSubstitutions, suggestToComplete } from "@/lib/recommend";
import type { Food } from "@/lib/types";

const mandioca: Food = { id: 6, nome: "Mandioca, cozida", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 125, p: 0.6, c: 30, l: 0.3 } };
const pool = [...foods, mandioca];

describe("suggestSubstitutions", () => {
  it("sugere só do mesmo grupo, com gramatura que iguala as kcal", () => {
    const s = suggestSubstitutions(item(1, 100), pool, { limit: 5 });
    expect(s.map((x) => x.food.id).sort()).toEqual([5, 6]);
    for (const x of s) expect(Math.abs(x.delta.kcal)).toBeLessThan(x.food.n.kcal! * 0.03 + 5);
  });
  it("ordena pela proximidade de macros na porção equivalente em kcal, respeitando o preparo", () => {
    const s = suggestSubstitutions(item(1, 100), pool, { limit: 5 });
    // mandioca cozida vem antes do macarrão cru, mesmo que 35 g de macarrão tenha macros mais próximos
    expect(s.map((x) => x.food.id)).toEqual([6, 5]);
  });
  it("exclui o próprio alimento e os que violam restrições", () => {
    const s = suggestSubstitutions(item(1, 100), pool, { restricoes: { tags: ["gluten"], termos: "" } });
    expect(s.map((x) => x.food.id)).toEqual([6]);
  });
  it("favoritos desempatam candidatos equivalentes, sem passar por cima do preparo", () => {
    const aipim: Food = { ...mandioca, id: 9, nome: "Aipim, cozido" };
    const dois = [arroz, mandioca, aipim];
    expect(suggestSubstitutions(item(1, 100), dois)[0].food.id).toBe(6);
    expect(suggestSubstitutions(item(1, 100), dois, { favoritos: new Map([[9, 2]]) })[0].food.id).toBe(9);
    // macarrão cru não passa à frente do cozido nem sendo o preferido
    expect(suggestSubstitutions(item(1, 100), pool, { favoritos: new Map([[5, 20]]) })[0].food.id).toBe(6);
  });
  it("item sem vínculo não gera sugestão", () => {
    expect(suggestSubstitutions(item(undefined, 100), pool)).toEqual([]);
  });
  it("arredonda gramas para múltiplos de 5", () => {
    for (const x of suggestSubstitutions(item(1, 137), pool)) expect(x.gramas % 5).toBe(0);
  });
});

describe("suggestSubstitutions — preparo e porção", () => {
  const quinoa: Food = { id: 7, nome: "Quinoa, cozida", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 120, p: 4.4, c: 21.3, l: 1.9 } };
  const flocos: Food = { id: 8, nome: "Cereais, milho, flocos, sem sal", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 370, p: 7.3, c: 80.8, l: 1.6 } };
  it("prefere o mesmo estado de preparo mesmo com macros um pouco piores", () => {
    const s = suggestSubstitutions(item(1, 100), [arroz, quinoa, flocos], { limit: 2 });
    expect(s[0].food.id).toBe(7); // cozido por cozido, não flocos secos
  });
});

describe("suggestToComplete", () => {
  it("não sugere bebidas, açúcares, industrializados nem itens crus/em pó", () => {
    const capuccino: Food = { id: 20, nome: "Capuccino, pó", grupo: "Bebidas (alcoólicas e não alcoólicas)", origem: "TACO", n: { kcal: 410, p: 11, c: 74, l: 8.6 } };
    const doce: Food = { id: 21, nome: "Goiabada, cascão", grupo: "Produtos açucarados", origem: "TACO", n: { kcal: 300, p: 0.3, c: 78, l: 0 } };
    const cru: Food = { id: 22, nome: "Arroz, integral, cru", grupo: "Cereais e derivados", origem: "TACO", n: { kcal: 360, p: 7.3, c: 77.5, l: 1.9 } };
    const condensado: Food = { id: 23, nome: "Leite, condensado", grupo: "Leite e derivados", origem: "TACO", n: { kcal: 313, p: 7.7, c: 57, l: 6.7 } };
    const s = suggestToComplete({ kcal: 350, p: 10, c: 70, l: 8 }, [capuccino, doce, cru, condensado, arroz], { limit: 10 });
    expect(s.map((x) => x.food.id)).not.toContain(23);
    expect(s.map((x) => x.food.id)).not.toContain(20);
    expect(s.map((x) => x.food.id)).not.toContain(21);
    expect(s.map((x) => x.food.id)).not.toContain(22);
  });

  it("sugere o que reduz o que falta, sem estourar", () => {
    const falta = { kcal: 160, p: 32, c: 0, l: 2.5 };
    const s = suggestToComplete(falta, pool, { limit: 3 });
    expect(s[0].food.id).toBe(2);
    expect(s[0].gramas).toBe(100);
    expect(s[0].residual.kcal).toBeLessThan(falta.kcal);
  });
  it("nada a sugerir quando o saldo já fechou ou estourou", () => {
    expect(suggestToComplete({ kcal: 0, p: 0, c: 0, l: 0 }, pool)).toEqual([]);
    expect(suggestToComplete({ kcal: -200, p: -10, c: -20, l: -5 }, pool)).toEqual([]);
  });
  it("respeita restrições", () => {
    const s = suggestToComplete({ kcal: 300, p: 10, c: 60, l: 1 }, pool, { restricoes: { tags: ["gluten"], termos: "" }, limit: 10 });
    expect(s.every((x) => x.food.id !== 5)).toBe(true);
  });
  it("gramas ficam entre 10 e 300 em múltiplos de 5", () => {
    for (const x of suggestToComplete({ kcal: 500, p: 20, c: 60, l: 10 }, pool, { limit: 10 })) {
      expect(x.gramas).toBeGreaterThanOrEqual(10);
      expect(x.gramas).toBeLessThanOrEqual(300);
      expect(x.gramas % 5).toBe(0);
    }
  });
});
