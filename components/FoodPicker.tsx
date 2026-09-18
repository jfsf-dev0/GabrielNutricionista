"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchFoods, violations } from "@/lib/foods";
import { useFoods } from "./FoodsProvider";
import { inputCls } from "./ui";
import type { Food, Restrictions } from "@/lib/types";

interface Props {
  onPick: (food: Food) => void;
  restricoes: Restrictions;
  favoritos: Map<number, number>;
  placeholder?: string;
}

/** Busca com autocomplete na base de alimentos. Alimentos que violam restrições aparecem sinalizados. */
export default function FoodPicker({ onPick, restricoes, favoritos, placeholder = "Buscar alimento (ex.: arroz, frango grelhado)…" }: Props) {
  const { foods, status } = useFoods();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const r = searchFoods(foods, q, 30);
    // favoritos primeiro, mantendo a ordem de relevância dentro de cada grupo
    return [...r].sort((a, b) => (favoritos.get(b.id) ?? 0) - (favoritos.get(a.id) ?? 0)).slice(0, 8);
  }, [foods, q, favoritos]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-stone-400" />
        <input
          value={q}
          disabled={status !== "ready"}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={status === "loading" ? "Carregando base de alimentos…" : status === "error" ? "Base indisponível" : placeholder}
          className={`${inputCls} pl-7`}
        />
      </div>
      {open && q.trim() && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-stone-200 rounded shadow-lg max-h-64 overflow-y-auto text-xs">
          {results.length === 0 && <li className="px-2 py-2 text-stone-400">Nada encontrado.</li>}
          {results.map((f) => {
            const v = violations(f, restricoes);
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onPick(f); setQ(""); setOpen(false); }}
                  className="w-full text-left px-2 py-1.5 hover:bg-stone-50 flex justify-between gap-2"
                >
                  <span>
                    {favoritos.has(f.id) && <span className="text-amber-500 mr-1" title="Usado com frequência">★</span>}
                    {f.nome}
                    {v.length > 0 && <span className="ml-1.5 text-[10px] text-red-600 font-medium">⚠ {v.join(", ")}</span>}
                    <span className="block text-[10px] text-stone-400">{f.grupo} · {f.origem}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 tabular-nums whitespace-nowrap">
                    {f.n.kcal} kcal · P {f.n.p ?? "–"} · C {f.n.c ?? "–"} · L {f.n.l ?? "–"}
                    <span className="block text-right text-stone-400">por 100 g</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
