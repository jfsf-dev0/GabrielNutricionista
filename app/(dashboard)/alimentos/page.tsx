"use client";

import React, { useState } from "react";
import {
  Apple,
  Search,
  Filter,
  Calculator,
  Plus,
  Scale,
  Sparkles,
} from "lucide-react";
import { TACO_DATABASE, calculatePortionMacros } from "@/lib/taco";
import { FoodItemTACO } from "@/lib/types";

export default function TacoExplorerPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedFood, setSelectedFood] = useState<FoodItemTACO>(TACO_DATABASE[0]);
  const [selectedMeasureGrams, setSelectedMeasureGrams] = useState<number>(120);

  const categories = [
    "Todos",
    "Carnes & Ovos",
    "Cereais & Leguminosas",
    "Frutas & Sucos",
    "Laticínios",
    "Gorduras & Óleos",
    "Suplementos",
    "Verduras & Legumes",
  ];

  const filtered = TACO_DATABASE.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || item.nome.toLowerCase().includes(q) || item.categoria.toLowerCase().includes(q);
    const matchC = selectedCategory === "Todos" || item.categoria === selectedCategory;
    return matchQ && matchC;
  });

  const macrosCalculated = calculatePortionMacros(selectedFood, selectedMeasureGrams);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Tabela TACO · Composição de Alimentos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tabela Brasileira de Composição de Alimentos (NEPA/UNICAMP) com medidas caseiras usuais e conversor de macros.
          </p>
        </div>
      </div>

      {/* Top Interactive Portion Calculator */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Simulador de Medidas Caseiras & Porções
              </h3>
              <p className="text-[11px] text-stone-400">
                Alimento selecionado: <strong className="text-stone-800">{selectedFood.nome}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">
              {selectedFood.categoria}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Measure selection buttons */}
          <div className="lg:col-span-6 space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Escolha uma Medida Caseira ou ajuste os gramas:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {selectedFood.medidasCaseiras.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMeasureGrams(m.gramas)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    selectedMeasureGrams === m.gramas
                      ? "border-stone-900 bg-stone-900 text-white font-semibold shadow-2xs"
                      : "border-stone-200 bg-stone-50 hover:bg-white text-stone-800"
                  }`}
                >
                  <div>{m.descricao}</div>
                  <div className="text-[10px] opacity-70 font-mono">{m.gramas} gramas</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-stone-500">Gramatura precisa:</span>
              <input
                type="number"
                value={selectedMeasureGrams}
                onChange={(e) => setSelectedMeasureGrams(Number(e.target.value) || 0)}
                className="w-24 border border-stone-300 rounded p-1 text-xs font-mono font-bold text-stone-900 text-right outline-none"
              />
              <span className="text-xs text-stone-500 font-mono">gramas</span>
            </div>
          </div>

          {/* Calculated Result Cards */}
          <div className="lg:col-span-6 grid grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-center font-mono">
            <div className="p-2 bg-white rounded-lg border border-stone-200/80 shadow-2xs">
              <div className="text-[10px] text-stone-400">Calorias</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">
                {macrosCalculated.calorias}
              </div>
              <div className="text-[9px] text-stone-400">kcal</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-stone-200/80 shadow-2xs">
              <div className="text-[10px] text-stone-400">Proteínas</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">
                {macrosCalculated.proteinas}g
              </div>
              <div className="text-[9px] text-stone-400">
                {Math.round((macrosCalculated.proteinas * 4 / (macrosCalculated.calorias || 1)) * 100)}%
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-stone-200/80 shadow-2xs">
              <div className="text-[10px] text-stone-400">Carboidratos</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">
                {macrosCalculated.carboidratos}g
              </div>
              <div className="text-[9px] text-stone-400">
                {Math.round((macrosCalculated.carboidratos * 4 / (macrosCalculated.calorias || 1)) * 100)}%
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-stone-200/80 shadow-2xs">
              <div className="text-[10px] text-stone-400">Lipídios</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">
                {macrosCalculated.gorduras}g
              </div>
              <div className="text-[9px] text-stone-400">
                {Math.round((macrosCalculated.gorduras * 9 / (macrosCalculated.calorias || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Search & Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs space-y-3 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar alimento da Tabela TACO..."
              className="w-full bg-transparent text-stone-800 placeholder-stone-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3">Alimento (Base 100g)</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Calorias</th>
                <th className="p-3 text-right">Proteína</th>
                <th className="p-3 text-right">Carboidrato</th>
                <th className="p-3 text-right">Lipídios</th>
                <th className="p-3 text-right">Fibras</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => {
                const isSelected = selectedFood.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedFood(item);
                      setSelectedMeasureGrams(item.medidasCaseiras[0]?.gramas || 100);
                    }}
                    className={`hover:bg-stone-50 transition-colors cursor-pointer ${
                      isSelected ? "bg-stone-100/70 font-semibold" : ""
                    }`}
                  >
                    <td className="p-3 font-medium text-stone-900">{item.nome}</td>
                    <td className="p-3 text-stone-500">{item.categoria}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{item.calorias} kcal</td>
                    <td className="p-3 text-right font-mono tabular-nums">{item.proteinas}g</td>
                    <td className="p-3 text-right font-mono tabular-nums">{item.carboidratos}g</td>
                    <td className="p-3 text-right font-mono tabular-nums">{item.gorduras}g</td>
                    <td className="p-3 text-right font-mono tabular-nums">{item.fibras}g</td>
                    <td className="p-3 text-center">
                      <button className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px]">
                        Selecionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
