import { describe, expect, it } from "vitest";
import { fmt, itemQty, microGroups } from "@/lib/report";

describe("fmt", () => {
  it("usa vírgula decimal e separador de milhar pt-BR", () => {
    expect(fmt(1479.64, 1)).toBe("1.479,6");
    expect(fmt(2, 0)).toBe("2");
    expect(fmt(0.04, 1)).toBe("0");
  });
});

describe("itemQty", () => {
  it("item vinculado: gramas + medida", () => {
    expect(itemQty({ id: "1", foodId: 1, nome: "x", gramas: 30, medida: "1 col. sopa" })).toBe("30 g (1 col. sopa)");
    expect(itemQty({ id: "1", foodId: 1, nome: "x", gramas: 87.5 })).toBe("87,5 g");
  });
  it("item legado sem vínculo mostra o texto original", () => {
    expect(itemQty({ id: "1", nome: "x", gramas: 80, medida: "80 g (pronto)" })).toBe("80 g (pronto)");
  });
  it("sem gramas nem medida devolve vazio", () => {
    expect(itemQty({ id: "1", nome: "x", gramas: 0 })).toBe("");
  });
});

describe("microGroups", () => {
  it("lista só o que existe, com unidade, e ignora chaves ausentes", () => {
    const g = microGroups({ fibras: 33.61, colesterol: 604.8, sodio: 1479.6, ferro: 11 });
    expect(g.lipideos).toBe("Fibras: 33,6 g · Colesterol: 604,8 mg");
    expect(g.minerais).toBe("Sódio: 1.479,6 mg · Ferro: 11 mg");
    expect(g.vitaminas).toBe("");
  });
});
