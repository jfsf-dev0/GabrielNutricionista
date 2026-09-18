import { describe, expect, it } from "vitest";
import { createFavoritos, type KV } from "@/lib/favoritos";

const memory = (): KV => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

describe("favoritos", () => {
  it("conta usos por alimento", () => {
    const f = createFavoritos(memory());
    f.bump([1, 2, 1]);
    expect(f.all().get(1)).toBe(2);
    expect(f.all().get(2)).toBe(1);
  });
  it("conteúdo corrompido ou de tipo errado não quebra", () => {
    const kv = memory();
    kv.setItem("gn:favoritos", "{nao-json");
    expect(createFavoritos(kv).all().size).toBe(0);
    kv.setItem("gn:favoritos", "[1,2]");
    expect(createFavoritos(kv).all().size).toBe(0);
    kv.setItem("gn:favoritos", JSON.stringify({ a: 1, "2": "x", "3": -4, "4": 5 }));
    expect([...createFavoritos(kv).all().keys()]).toEqual([4]);
  });
  it("armazenamento cheio devolve false", () => {
    const bad: KV = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => {} };
    expect(createFavoritos(bad).bump([1])).toBe(false);
  });
});
