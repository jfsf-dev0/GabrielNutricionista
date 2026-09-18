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

describe("migrateProfile — sanitização de perfil v2 malformado", () => {
  const ex = { kcal: 0, p: 0, c: 0, l: 0 };
  const meal = (o: any) => ({ id: 1, nome: "x", horario: "", opcoes: [o] });
  const opt = (over: any = {}) => ({ id: "a", titulo: "t", extra: ex, itens: [], ...over });
  const item = (over: any) => ({ id: "i", foodId: 1, nome: "a", gramas: 100, ...over });

  it("completa extra, itens e opcoes ausentes em vez de quebrar", () => {
    const a = migrateProfile({ versao: 2, meals: [meal({ id: "a", titulo: "t", itens: [] })] });
    expect(a.meals[0].opcoes[0].extra).toEqual({ kcal: 0, p: 0, c: 0, l: 0 });
    const b = migrateProfile({ versao: 2, meals: [{ id: 1, nome: "x", horario: "" }] });
    expect(b.meals[0].opcoes).toEqual([]);
    const c = migrateProfile({ versao: 2, meals: [meal({ id: "a", titulo: "t", extra: ex })] });
    expect(c.meals[0].opcoes[0].itens).toEqual([]);
  });
  it("limita gramas ao intervalo [0, 5000] e converte texto numérico", () => {
    const g = (v: any) => migrateProfile({ versao: 2, meals: [meal(opt({ itens: [item({ gramas: v })] }))] }).meals[0].opcoes[0].itens[0].gramas;
    expect(g(-500)).toBe(0);
    expect(g(1e9)).toBe(5000);
    expect(g("100")).toBe(100);
    expect(g("abc")).toBe(0);
    expect(g(NaN)).toBe(0);
  });
  it("ajuste manual não aceita negativos nem absurdos", () => {
    const p = migrateProfile({ versao: 2, meals: [meal(opt({ extra: { kcal: -50, p: 1e12, c: "x", l: 3 } }))] });
    expect(p.meals[0].opcoes[0].extra).toEqual({ kcal: 0, p: 2000, c: 0, l: 3 });
  });
  it("metas numéricas ficam finitas e não negativas", () => {
    const p = migrateProfile({ versao: 2, calorias: null, prot: "abc", carbo: -1, gord: 1e9, meals: [] });
    expect([p.calorias, p.prot, p.carbo]).toEqual([0, 0, 0]);
    expect(p.gord).toBe(2000);
  });
  it("tags inválidas são descartadas; termos viram texto", () => {
    expect(migrateProfile({ versao: 2, restricoes: { tags: "lactose", termos: 5 }, meals: [] }).restricoes).toEqual({ tags: [], termos: "5" });
    expect(migrateProfile({ versao: 2, restricoes: { tags: ["lactose", "xyz", 3] }, meals: [] }).restricoes.tags).toEqual(["lactose"]);
  });
  it("suplementos e micros inválidos", () => {
    const p = migrateProfile({ versao: 2, suplementos: [null, 3, { nome: "Creatina" }], micros: { modo: "zzz" }, meals: [] });
    expect(p.suplementos).toHaveLength(1);
    expect(p.suplementos[0]).toMatchObject({ nome: "Creatina", posologia: "", obs: "" });
    expect(p.micros.modo).toBe("auto");
  });
  it("meals como objeto e ids duplicados viram array com ids únicos", () => {
    const p = migrateProfile({ versao: 2, meals: { a: { id: 3, nome: "A", opcoes: [] }, b: { id: 3, nome: "B", opcoes: [] } } });
    expect(p.meals).toHaveLength(2);
    expect(new Set(p.meals.map((m) => m.id)).size).toBe(2);
  });
  it("itens inválidos são descartados; foodId não inteiro vira sem vínculo", () => {
    const p = migrateProfile({ versao: 2, meals: [meal(opt({ itens: [null, "x", item({ foodId: "abc" }), item({ foodId: 7.5 }), item({ foodId: 3 })] }))] });
    const it = p.meals[0].opcoes[0].itens;
    expect(it).toHaveLength(3);
    expect(it.map((i) => i.foodId)).toEqual([undefined, undefined, 3]);
  });
  it("antropometria filtra campos e enums", () => {
    const p = migrateProfile({ versao: 2, antropometria: { peso: "80", altura: -5, sexo: "X", objetivo: "perda", lixo: 1 }, meals: [] });
    expect(p.antropometria).toEqual({ peso: 80, objetivo: "perda" });
  });
});
