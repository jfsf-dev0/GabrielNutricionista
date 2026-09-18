"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calculator, Search } from "lucide-react";
import { useFoods } from "@/components/FoodsProvider";
import { NumInput } from "@/components/ui";
import { searchFoods } from "@/lib/foods";
import { MAX_GRAMAS } from "@/lib/limits";
import { macroPercents, scaleNutrients } from "@/lib/nutrition";
import { fmt } from "@/lib/report";
import type { Food } from "@/lib/types";

const MAX_LINHAS = 80;

export default function FoodExplorerPage() {
  const { foods, status } = useFoods();
  const [search, setSearch] = useState("");
  const [grupo, setGrupo] = useState("Todos");
  const [selected, setSelected] = useState<Food | null>(null);
  const [gramas, setGramas] = useState(100);

  const grupos = useMemo(() => ["Todos", ...[...new Set(foods.map((f) => f.grupo))].sort((a, b) => a.localeCompare(b, "pt-BR"))], [foods]);

  const filtered = useMemo(() => {
    const base = search.trim() ? searchFoods(foods, search, 300) : [...foods].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return grupo === "Todos" ? base : base.filter((f) => f.grupo === grupo);
  }, [foods, search, grupo]);

  useEffect(() => {
    if (!selected && foods.length) setSelected(foods.find((f) => f.nome.startsWith("Frango, peito, sem pele, grelhado")) ?? foods[0]);
  }, [foods, selected]);

  const n = selected ? scaleNutrients(selected.n, gramas) : {};
  const kcal = n.kcal ?? 0;
  const pct = macroPercents({ kcal, p: n.p ?? 0, c: n.c ?? 0, l: n.l ?? 0 });
  const nd = (v: number | undefined, un = "g") => (v === undefined ? "—" : `${fmt(v)}${un}`);

  if (status === "loading") return <div className="p-8 text-xs text-stone-600">Carregando base de alimentos…</div>;
  if (status === "error") return <div role="alert" className="p-8 text-xs text-red-700">Não foi possível carregar a base de alimentos. Recarregue a página.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Tabela TACO · Composição de Alimentos</h2>
        <p className="text-xs text-stone-600 mt-0.5">
          {foods.length} alimentos (TACO 4ª ed., NEPA/UNICAMP, e cadastro interno) com medidas caseiras e conversor de macros. “—” significa não informado na tabela de origem.
        </p>
      </div>

      {selected && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800"><Calculator className="w-4 h-4" aria-hidden="true" /></div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Simulador de medidas caseiras e porções</h3>
                <p className="text-[11px] text-stone-600">Alimento selecionado: <strong className="text-stone-900">{selected.nome}</strong></p>
              </div>
            </div>
            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">{selected.grupo} · {selected.origem}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 space-y-2">
              <div className="block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Escolha uma medida caseira ou ajuste os gramas</div>
              {selected.medidas?.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {selected.medidas.map((m) => (
                    <button
                      key={m.nome}
                      onClick={() => setGramas(m.gramas)}
                      aria-pressed={gramas === m.gramas}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        gramas === m.gramas ? "border-stone-900 bg-stone-900 text-white font-semibold" : "border-stone-200 bg-stone-50 hover:bg-white text-stone-800"
                      }`}
                    >
                      <div>{m.nome}</div>
                      <div className="text-[10px] opacity-80 font-mono">{m.gramas} gramas</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-600">Sem medidas caseiras cadastradas para este alimento; informe os gramas.</p>
              )}
              <div className="pt-2 flex items-center gap-3">
                <label htmlFor="gramas-precisa" className="text-xs text-stone-600">Gramatura precisa:</label>
                <NumInput id="gramas-precisa" value={gramas} max={MAX_GRAMAS} onChange={setGramas} className="!w-24 text-right font-mono font-bold" />
                <span className="text-xs text-stone-600 font-mono">gramas</span>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-5 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-center font-mono">
              {[
                ["Calorias", nd(n.kcal, ""), "kcal"],
                ["Proteínas", nd(n.p), `${pct.p}%`],
                ["Carboidratos", nd(n.c), `${pct.c}%`],
                ["Lipídios", nd(n.l), `${pct.l}%`],
                ["Fibras", nd(n.fibras), ""],
              ].map(([label, value, sub]) => (
                <div key={label} className="p-2 bg-white rounded-lg border border-stone-200/80">
                  <div className="text-[10px] text-stone-600">{label}</div>
                  <div className="text-lg font-bold text-stone-900 mt-0.5">{value}</div>
                  <div className="text-[9px] text-stone-600">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs space-y-3 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full max-w-md bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar alimento (ex.: arroz, whey, frnago)…"
              aria-label="Pesquisar alimento"
              className="w-full bg-transparent text-stone-900 placeholder-stone-500 focus:outline-hidden"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[11px]" role="group" aria-label="Filtrar por grupo">
            {grupos.map((g) => (
              <button
                key={g}
                onClick={() => setGrupo(g)}
                aria-pressed={grupo === g}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  grupo === g ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-x-auto" tabIndex={0} role="region" aria-label="Tabela de alimentos">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-600 font-mono text-[10px] uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th scope="col" className="p-3">Alimento (base 100 g)</th>
                <th scope="col" className="p-3">Grupo</th>
                <th scope="col" className="p-3 text-right">Calorias</th>
                <th scope="col" className="p-3 text-right">Proteína</th>
                <th scope="col" className="p-3 text-right">Carboidrato</th>
                <th scope="col" className="p-3 text-right">Lipídios</th>
                <th scope="col" className="p-3 text-right">Fibras</th>
                <th scope="col" className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.slice(0, MAX_LINHAS).map((f) => (
                <tr key={f.id} className={`hover:bg-stone-50 ${selected?.id === f.id ? "bg-stone-100/70 font-semibold" : ""}`}>
                  <td className="p-3 font-medium text-stone-900">{f.nome}</td>
                  <td className="p-3 text-stone-600">{f.grupo}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{nd(f.n.kcal, " kcal")}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{nd(f.n.p)}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{nd(f.n.c)}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{nd(f.n.l)}</td>
                  <td className="p-3 text-right font-mono tabular-nums">{nd(f.n.fibras)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => { setSelected(f); setGramas(f.medidas?.[0]?.gramas ?? 100); }}
                      aria-label={`Selecionar ${f.nome}`}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px]"
                    >
                      Selecionar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-stone-600">Nenhum alimento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-stone-600" aria-live="polite">
          {filtered.length > MAX_LINHAS ? `Mostrando ${MAX_LINHAS} de ${filtered.length}. Refine a busca para ver os demais.` : `${filtered.length} alimento(s).`}
        </p>
      </div>
    </div>
  );
}
