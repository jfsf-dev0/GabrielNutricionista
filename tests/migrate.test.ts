import { describe, expect, it } from "vitest";
import { migrateProfile, parseLegacyItem } from "@/lib/migrate";
import { defaultProfile } from "@/lib/defaultProfile";
import { SCHEMA_VERSION } from "@/lib/types";

describe("parseLegacyItem", () => {
  it("separa nome e quantidade em gramas", () => {
    const i = parseLegacyItem("Arroz branco cozido | 80 g");
    expect(i).toMatchObject({ nome: "Arroz branco cozido", gramas: 80, medida: "80 g" });
    expect(i.foodId).toBeUndefined();
  });
  it("entende decimais com vírgula, ml e medidas caseiras", () => {
    expect(parseLegacyItem("Torradas integrais (3 un.) | 22,5 g").gramas).toBe(22.5);
    expect(parseLegacyItem("Leite | 165 ml").gramas).toBe(165);
    expect(parseLegacyItem("Whey | 10 g (1 col. sopa)").gramas).toBe(10);
  });
  it("quantidade não numérica vira 0 g", () => {
    expect(parseLegacyItem("Mix de legumes | À vontade")).toMatchObject({ gramas: 0, medida: "À vontade" });
  });
  it("linhas ↳, * e — viram notas", () => {
    for (const l of ["↳ Subst: batata-doce", "*Preparo: bater", "— dica"]) {
      expect(parseLegacyItem(l)).toMatchObject({ nota: true, nome: l });
    }
  });
});

describe("migrateProfile", () => {
  const legacy = {
    paciente: "Ana", data: "hoje", fase: "f", nutricionista: "N", crn: "c", telefone: "t", local: "l",
    calorias: 2000, prot: 150, carbo: 200, gord: 60, fibras: 30, agua: "3L", suplementos: [],
    meals: {
      2: { id: 2, nome: "Almoço", horario: "12h", optA: { titulo: "A", cal: 600, p: 50, c: 70, l: 15, itens: ["Arroz | 80 g"] }, optB: { titulo: "B", cal: 500, p: 40, c: 60, l: 10, itens: [] } },
      1: { id: 1, nome: "Café", horario: "7h", optA: { titulo: "A", cal: 400, p: 20, c: 50, l: 10, itens: [] }, optB: { titulo: "B", cal: 450, p: 25, c: 55, l: 12, itens: [] } },
    },
    receita: { nome: "r", rendimento: "", ingredientes: "", preparo: "" },
    lipideosStr: "<b>Ácidos:</b> 1g", mineraisStr: "<b>Min:</b> 2g", vitaminasStr: "<b>Vit:</b> 3g",
  };
  it("converte o perfil legado preservando totais como ajuste manual", () => {
    const p = migrateProfile(legacy);
    expect(p.versao).toBe(SCHEMA_VERSION);
    expect(p.meals.map((m) => m.id)).toEqual([1, 2]);
    expect(p.meals[1].opcoes).toHaveLength(2);
    expect(p.meals[1].opcoes[0].extra).toEqual({ kcal: 600, p: 50, c: 70, l: 15 });
    expect(p.meals[1].opcoes[0].itens[0]).toMatchObject({ nome: "Arroz", gramas: 80 });
    expect(p.micros).toEqual({ modo: "manual", lipideos: "Ácidos: 1g", minerais: "Min: 2g", vitaminas: "Vit: 3g" });
    expect(p.restricoes).toEqual({ tags: [], termos: "" });
    expect(p.id).toBeTruthy();
  });
  it("perfil v2 passa quase intacto e recebe valores padrão faltantes", () => {
    const p = migrateProfile(defaultProfile);
    expect(p).toEqual(expect.objectContaining({ paciente: defaultProfile.paciente, versao: SCHEMA_VERSION }));
    const parcial = migrateProfile({ versao: 2, paciente: "X", meals: [] });
    expect(parcial.suplementos).toEqual([]);
    expect(parcial.restricoes.tags).toEqual([]);
  });
  it("lixo não quebra", () => {
    expect(migrateProfile(null).meals).toEqual([]);
    expect(migrateProfile("x").paciente).toBe("");
  });
});
