import { beforeEach, describe, expect, it } from "vitest";
import { baseProfile } from "./fixtures";
import { createStore, type KV } from "@/lib/storage";

const memory = (): KV => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

describe("storage", () => {
  let kv: KV;
  beforeEach(() => { kv = memory(); });

  it("salva, lista (mais recente primeiro) e carrega", () => {
    const s = createStore(kv);
    s.save(baseProfile({ id: "a", paciente: "Ana", atualizadoEm: "2026-01-01T00:00:00.000Z" }));
    s.save(baseProfile({ id: "b", paciente: "Bia", atualizadoEm: "2026-02-01T00:00:00.000Z" }));
    expect(s.list().map((p) => p.id)).toEqual(["b", "a"]);
    expect(s.load("a")?.paciente).toBe("Ana");
  });
  it("salvar de novo o mesmo id substitui", () => {
    const s = createStore(kv);
    s.save(baseProfile({ id: "a", paciente: "Ana" }));
    s.save(baseProfile({ id: "a", paciente: "Ana Maria" }));
    expect(s.list()).toHaveLength(1);
    expect(s.load("a")?.paciente).toBe("Ana Maria");
  });
  it("remove", () => {
    const s = createStore(kv);
    s.save(baseProfile({ id: "a" }));
    s.remove("a");
    expect(s.list()).toEqual([]);
  });
  it("conteúdo corrompido não quebra", () => {
    kv.setItem("gn:pacientes", "{nao-json");
    expect(createStore(kv).list()).toEqual([]);
  });
  it("rascunho e favoritos persistem", () => {
    const s = createStore(kv);
    s.saveDraft(baseProfile({ id: "d", paciente: "Rascunho" }));
    expect(s.loadDraft()?.paciente).toBe("Rascunho");
    s.bumpFavoritos([1, 2, 1]);
    expect(s.favoritos().get(1)).toBe(2);
    expect(s.favoritos().get(2)).toBe(1);
  });
  it("erro de armazenamento cheio é engolido e devolve false", () => {
    const bad: KV = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => {} };
    expect(createStore(bad).save(baseProfile())).toBe(false);
  });
});
