import { describe, expect, it } from "vitest";
import { foods, arroz, frango, leite, macarrao } from "./fixtures";
import { normalize, searchFoods, violations } from "@/lib/foods";
import type { Food } from "@/lib/types";

describe("normalize", () => {
  it("remove acentos, caixa e pontuação", () => {
    expect(normalize("Pão, de Forma!")).toBe("pao de forma");
  });
});

describe("searchFoods", () => {
  it("acha por prefixo ignorando acento", () => {
    expect(searchFoods(foods, "macarrao")[0]).toBe(macarrao);
  });
  it("exige todos os termos", () => {
    const r = searchFoods(foods, "arroz cozido");
    expect(r).toEqual([arroz]);
    expect(searchFoods(foods, "arroz frango")).toEqual([]);
  });
  it("tolera erro de digitação", () => {
    expect(searchFoods(foods, "aroz")[0]).toBe(arroz);
    expect(searchFoods(foods, "frnago")[0]).toBe(frango);
  });
  it("consulta vazia não devolve nada e respeita o limite", () => {
    expect(searchFoods(foods, "  ")).toEqual([]);
    expect(searchFoods(foods, "a", 2).length).toBeLessThanOrEqual(2);
  });
  it("prioriza nomes que começam com o termo", () => {
    const outro: Food = { ...frango, id: 9, nome: "Salada de frango" };
    expect(searchFoods([outro, frango], "frango")[0]).toBe(frango);
  });
});

describe("violations", () => {
  const r = (tags: any[], termos = "") => ({ tags, termos });
  it("lactose pega o grupo de laticínios", () => {
    expect(violations(leite, r(["lactose"]))).toEqual(["lactose"]);
    expect(violations(arroz, r(["lactose"]))).toEqual([]);
  });
  it("glúten pega derivados de trigo pelo nome", () => {
    expect(violations(macarrao, r(["gluten"]))).toEqual(["gluten"]);
  });
  it("vegano bloqueia carnes e laticínios", () => {
    expect(violations(frango, r(["vegano"]))).toEqual(["vegano"]);
    expect(violations(leite, r(["vegano"]))).toEqual(["vegano"]);
    expect(violations(arroz, r(["vegano"]))).toEqual([]);
  });
  it("termos livres casam pelo nome, sem acento", () => {
    expect(violations(macarrao, r([], "macarrão, kiwi"))).toEqual(["macarrão"]);
    expect(violations(arroz, r([], "kiwi"))).toEqual([]);
  });
});

import { restrictionsFromStrings } from "@/lib/foods";

describe("restrictionsFromStrings", () => {
  it("mapeia textos do cadastro para tags", () => {
    const r = restrictionsFromStrings(["Intolerância à lactose moderada", "Alergia a frutos do mar", "Celíaca (sem glúten)", "Sem restrições severas"]);
    expect(r.tags.sort()).toEqual(["frutosDoMar", "gluten", "lactose"]);
  });
  it("vegano e vegetariano são distintos", () => {
    expect(restrictionsFromStrings(["Vegana"]).tags).toEqual(["vegano"]);
    expect(restrictionsFromStrings(["Vegetariano"]).tags).toEqual(["vegetariano"]);
  });
  it("sem restrições devolve vazio", () => {
    expect(restrictionsFromStrings(["Sem restrições alimentares", "Nenhuma"])).toEqual({ tags: [], termos: "" });
  });
});
