"use client";

import React, { useState } from "react";
import { Search, X, Plus, Check } from "lucide-react";
import { TACO_DATABASE, calculatePortionMacros } from "@/lib/taco";
import { FoodItemTACO } from "@/lib/types";

interface TacoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (formattedLine: string, macros: { cal: number; p: number; c: number; l: number }) => void;
  targetMealName: string;
  targetOption: "A" | "B";
}

export default function TacoSearchModal({
  isOpen,
  onClose,
  onAddFood,
  targetMealName,
  targetOption,
}: TacoSearchModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedFood, setSelectedFood] = useState<FoodItemTACO | null>(null);
  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState(0);
  const [customGrams, setCustomGrams] = useState(100);

  if (!isOpen) return null;

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

  const activeMeasure = selectedFood?.medidasCaseiras[selectedMeasureIndex];
  const effectiveGrams = activeMeasure ? activeMeasure.gramas : customGrams;
  const currentMacros = selectedFood
    ? calculatePortionMacros(selectedFood, effectiveGrams)
    : { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };

  const handleConfirm = () => {
    if (!selectedFood) return;
    const measureLabel = activeMeasure ? activeMeasure.descricao : `${effectiveGrams}g`;
    // Formato: Nome do Alimento (medida caseira) | 120 g
    const line = `${selectedFood.nome} (${measureLabel}) | ${effectiveGrams} g`;
    onAddFood(line, {
      cal: currentMacros.calorias,
      p: currentMacros.proteinas,
      c: currentMacros.carboidratos,
      l: currentMacros.gorduras,
    });
    onClose();
    setSelectedFood(null);
    setSearch("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/70">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Banco de Alimentos TACO (Tabela Brasileira)
            </h3>
            <p className="text-[11px] text-stone-500">
              Adicionando à: <strong className="text-stone-800">{targetMealName} (Opção {targetOption})</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-stone-100 space-y-2">
          <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-3 py-1.5 text-xs border border-stone-200">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite para filtrar (ex: frango, arroz, aveia, whey, banana)..."
              className="w-full bg-transparent text-stone-800 placeholder-stone-400 focus:outline-hidden"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Content: List + Portion Selector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 overflow-hidden">
          {/* List of Foods */}
          <div className="overflow-y-auto p-2 space-y-1 max-h-72 md:max-h-96 text-xs">
            {filtered.map((food) => {
              const isSelected = selectedFood?.id === food.id;
              return (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setSelectedMeasureIndex(0);
                    setCustomGrams(food.medidasCaseiras[0]?.gramas || 100);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-all flex flex-col gap-0.5 cursor-pointer ${
                    isSelected
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "hover:bg-stone-100 text-stone-800"
                  }`}
                >
                  <div className="font-semibold text-xs truncate">
                    {food.nome}
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                    <span>{food.categoria}</span>
                    <span>
                      {food.calorias} kcal · P:{food.proteinas}g · C:{food.carboidratos}g · L:{food.gorduras}g
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-xs text-stone-400">
                Nenhum alimento encontrado para &quot;{search}&quot;.
              </div>
            )}
          </div>

          {/* Portion & Macros Configuration */}
          <div className="p-4 flex flex-col justify-between bg-stone-50/50 text-xs overflow-y-auto">
            {selectedFood ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    Alimento Selecionado
                  </span>
                  <div className="font-bold text-sm text-stone-900 mt-0.5">
                    {selectedFood.nome}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Medida Caseira Pré-Configurada
                  </label>
                  <div className="space-y-1">
                    {selectedFood.medidasCaseiras.map((m, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedMeasureIndex === idx
                            ? "border-stone-900 bg-white shadow-2xs font-semibold text-stone-900"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="taco-measure"
                            checked={selectedMeasureIndex === idx}
                            onChange={() => {
                              setSelectedMeasureIndex(idx);
                              setCustomGrams(m.gramas);
                            }}
                            className="text-stone-900"
                          />
                          <span>{m.descricao}</span>
                        </div>
                        <span className="font-mono text-stone-500 text-[11px]">
                          {m.gramas}g
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Live Macro Calculation for Selected Portion */}
                <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Composição da Porção ({effectiveGrams}g)
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-1.5 bg-stone-50 rounded">
                      <div className="text-[9px] text-stone-400">Calorias</div>
                      <div className="text-xs font-bold text-stone-900">{currentMacros.calorias} kcal</div>
                    </div>
                    <div className="p-1.5 bg-stone-50 rounded">
                      <div className="text-[9px] text-stone-400">Proteína</div>
                      <div className="text-xs font-bold text-stone-900">{currentMacros.proteinas}g</div>
                    </div>
                    <div className="p-1.5 bg-stone-50 rounded">
                      <div className="text-[9px] text-stone-400">Carbo</div>
                      <div className="text-xs font-bold text-stone-900">{currentMacros.carboidratos}g</div>
                    </div>
                    <div className="p-1.5 bg-stone-50 rounded">
                      <div className="text-[9px] text-stone-400">Gordura</div>
                      <div className="text-xs font-bold text-stone-900">{currentMacros.gorduras}g</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inserir na Opção {targetOption}</span>
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 p-4">
                <Search className="w-8 h-8 text-stone-300 mb-2 stroke-1" />
                <p className="text-xs">
                  Selecione um alimento da lista ao lado para configurar a porção e medida caseira.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
