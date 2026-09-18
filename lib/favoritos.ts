export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const K_FAVS = "gn:favoritos";

/** Alimentos que o nutricionista mais usa (foodId -> vezes), para subir no ranking de busca e sugestões. */
export function createFavoritos(kv: KV) {
  const read = (): Record<string, number> => {
    try {
      const raw = kv.getItem(K_FAVS);
      const v = raw ? JSON.parse(raw) : {};
      return typeof v === "object" && v !== null && !Array.isArray(v) ? v : {};
    } catch {
      return {};
    }
  };
  return {
    all(): Map<number, number> {
      return new Map(
        Object.entries(read())
          .map(([k, v]): [number, number] => [Number(k), Number(v)])
          .filter(([k, v]) => Number.isInteger(k) && Number.isFinite(v) && v > 0),
      );
    },
    bump(ids: number[]): boolean {
      const m = this.all();
      for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
      try {
        kv.setItem(K_FAVS, JSON.stringify(Object.fromEntries(m)));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export type Favoritos = ReturnType<typeof createFavoritos>;

/** Favoritos sobre o localStorage; sem acesso ao armazenamento, mantém em memória da sessão. */
export function browserFavoritos(): Favoritos {
  try {
    const ls = window.localStorage;
    ls.setItem("gn:__probe", "1");
    ls.removeItem("gn:__probe");
    return createFavoritos(ls);
  } catch {
    const m = new Map<string, string>();
    return createFavoritos({ getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) });
  }
}
