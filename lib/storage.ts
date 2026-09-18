import { migrateProfile } from "./migrate";
import type { PatientProfile } from "./types";

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const K_PACIENTES = "gn:pacientes";
const K_DRAFT = "gn:rascunho";
const K_FAVS = "gn:favoritos";

function readJson<T>(kv: KV, key: string, fallback: T): T {
  try {
    const raw = kv.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(kv: KV, key: string, value: unknown): boolean {
  try {
    kv.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // cota cheia ou armazenamento bloqueado
  }
}

export function createStore(kv: KV) {
  const all = (): Record<string, unknown> => {
    const v = readJson<unknown>(kv, K_PACIENTES, {});
    return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  };

  return {
    list(): PatientProfile[] {
      return Object.values(all())
        .map(migrateProfile)
        .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
    },
    load(id: string): PatientProfile | null {
      const raw = all()[id];
      return raw ? migrateProfile(raw) : null;
    },
    save(p: PatientProfile): boolean {
      return writeJson(kv, K_PACIENTES, { ...all(), [p.id]: p });
    },
    remove(id: string): void {
      const { [id]: _, ...rest } = all();
      writeJson(kv, K_PACIENTES, rest);
    },
    saveDraft(p: PatientProfile): boolean {
      return writeJson(kv, K_DRAFT, p);
    },
    loadDraft(): PatientProfile | null {
      const raw = readJson<unknown>(kv, K_DRAFT, null);
      return raw ? migrateProfile(raw) : null;
    },
    /** foodId -> vezes que o nutricionista usou. */
    favoritos(): Map<number, number> {
      const obj = readJson<Record<string, number>>(kv, K_FAVS, {});
      return new Map(Object.entries(obj).map(([k, v]) => [Number(k), Number(v)]));
    },
    bumpFavoritos(ids: number[]): void {
      const m = this.favoritos();
      for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
      writeJson(kv, K_FAVS, Object.fromEntries(m));
    },
  };
}

export type Store = ReturnType<typeof createStore>;

/** Store sobre o localStorage; se estiver bloqueado (modo privado etc.), cai para memória da sessão. */
export function browserStore(): Store {
  try {
    const ls = window.localStorage;
    ls.setItem("gn:__probe", "1");
    ls.removeItem("gn:__probe");
    return createStore(ls);
  } catch {
    const m = new Map<string, string>();
    return createStore({
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => void m.set(k, v),
      removeItem: (k) => void m.delete(k),
    });
  }
}
