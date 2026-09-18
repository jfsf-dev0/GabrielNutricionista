"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PatientProfile } from "@/lib/types";

interface PatientEditorProps {
  profile: PatientProfile;
  onChange: (profile: PatientProfile) => void;
}

export default function PatientEditor({ profile, onChange }: PatientEditorProps) {
  const [activeTab, setActiveTab] = useState<"paciente" | "condutas" | "refeicoes" | "receita" | "nutrientes">("paciente");
  const [activeMealId, setActiveMealId] = useState<number>(1);

  const updateField = <K extends keyof PatientProfile>(field: K, value: PatientProfile[K]) => {
    onChange({ ...profile, [field]: value });
  };

  // Suplementos
  const handleAddSupplement = () => {
    const newSup = {
      id: `sup-${Date.now()}`,
      nome: "Novo Composto",
      posologia: "1 dose/dia",
      obs: "Diretriz clínica a ser seguida pelo paciente."
    };
    updateField("suplementos", [...profile.suplementos, newSup]);
  };

  const handleUpdateSupplement = (index: number, field: "nome" | "posologia" | "obs", value: string) => {
    const updated = [...profile.suplementos];
    updated[index] = { ...updated[index], [field]: value };
    updateField("suplementos", updated);
  };

  const handleRemoveSupplement = (index: number) => {
    const updated = profile.suplementos.filter((_, i) => i !== index);
    updateField("suplementos", updated);
  };

  // Refeições
  const currentMeal = profile.meals[activeMealId] || profile.meals[1];

  const updateMealField = (field: "nome" | "horario", value: string) => {
    const updatedMeals = {
      ...profile.meals,
      [activeMealId]: {
        ...currentMeal,
        [field]: value
      }
    };
    updateField("meals", updatedMeals);
  };

  const updateMealOpt = (
    opt: "optA" | "optB",
    field: "titulo" | "cal" | "p" | "c" | "l",
    value: string | number
  ) => {
    const updatedMeals = {
      ...profile.meals,
      [activeMealId]: {
        ...currentMeal,
        [opt]: {
          ...currentMeal[opt],
          [field]: field === "titulo" ? value : Number(value) || 0
        }
      }
    };
    updateField("meals", updatedMeals);
  };

  const updateMealItens = (opt: "optA" | "optB", text: string) => {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const updatedMeals = {
      ...profile.meals,
      [activeMealId]: {
        ...currentMeal,
        [opt]: {
          ...currentMeal[opt],
          itens: lines
        }
      }
    };
    updateField("meals", updatedMeals);
  };

  return (
    <aside className="no-print w-full md:w-[48%] lg:w-[45%] bg-white border-r border-stone-200 flex flex-col shrink-0">
      {/* Abas */}
      <div className="flex items-center hairline-b px-4 text-xs font-medium text-stone-500 overflow-x-auto shrink-0 bg-stone-50/50">
        <button
          onClick={() => setActiveTab("paciente")}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "paciente" ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
          }`}
        >
          01. Identificação & Metas
        </button>
        <button
          onClick={() => setActiveTab("condutas")}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "condutas" ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
          }`}
        >
          02. Suplementação
        </button>
        <button
          onClick={() => setActiveTab("refeicoes")}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "refeicoes" ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
          }`}
        >
          03. Refeições Diárias
        </button>
        <button
          onClick={() => setActiveTab("receita")}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "receita" ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
          }`}
        >
          04. Receituário
        </button>
        <button
          onClick={() => setActiveTab("nutrientes")}
          className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "nutrientes" ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
          }`}
        >
          05. Micronutrientes
        </button>
      </div>

      {/* Formulário com Rolagem */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* ABA 1: PACIENTE & METAS */}
        {activeTab === "paciente" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Nome do Paciente
                </label>
                <input
                  type="text"
                  value={profile.paciente}
                  onChange={(e) => updateField("paciente", e.target.value)}
                  className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Data da Prescrição
                </label>
                <input
                  type="text"
                  value={profile.data}
                  onChange={(e) => updateField("data", e.target.value)}
                  className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Fase do Protocolo
                </label>
                <input
                  type="text"
                  value={profile.fase}
                  onChange={(e) => updateField("fase", e.target.value)}
                  className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Nutricionista Responsável
                </label>
                <input
                  type="text"
                  value={profile.nutricionista}
                  onChange={(e) => updateField("nutricionista", e.target.value)}
                  className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="pt-3 hairline-t">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-2">
                Metas Energéticas Diárias
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Calorias (kcal)
                  </label>
                  <input
                    type="number"
                    value={profile.calorias}
                    onChange={(e) => updateField("calorias", Number(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.prot}
                    onChange={(e) => updateField("prot", Number(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Carboidratos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.carbo}
                    onChange={(e) => updateField("carbo", Number(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Lipídios (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.gord}
                    onChange={(e) => updateField("gord", Number(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Fibras (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.fibras}
                    onChange={(e) => updateField("fibras", Number(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Meta Hídrica
                  </label>
                  <input
                    type="text"
                    value={profile.agua}
                    onChange={(e) => updateField("agua", e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SUPLEMENTAÇÃO */}
        {activeTab === "condutas" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                Conduta Clínica & Suplementação
              </h3>
              <button
                onClick={handleAddSupplement}
                className="text-xs text-stone-900 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Item
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.suplementos.map((sup, idx) => (
                <div key={sup.id || idx} className="p-3 rounded border border-stone-200 bg-stone-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={sup.nome}
                      onChange={(e) => handleUpdateSupplement(idx, "nome", e.target.value)}
                      placeholder="Nome do Composto"
                      className="font-medium text-stone-900 bg-transparent text-xs w-[70%] outline-none"
                    />
                    <button
                      onClick={() => handleRemoveSupplement(idx)}
                      className="text-stone-400 hover:text-red-600 text-[11px] p-0.5"
                      title="Remover suplemento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sup.posologia}
                    onChange={(e) => handleUpdateSupplement(idx, "posologia", e.target.value)}
                    placeholder="Posologia & Horário"
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-800 outline-none bg-white focus:border-stone-900"
                  />
                  <textarea
                    rows={2}
                    value={sup.obs}
                    onChange={(e) => handleUpdateSupplement(idx, "obs", e.target.value)}
                    placeholder="Diretriz técnica / Observação laboratorial"
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-700 outline-none bg-white focus:border-stone-900"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: REFEIÇÕES DIÁRIAS */}
        {activeTab === "refeicoes" && (
          <div className="space-y-4">
            {/* Seletor de Refeição */}
            <div className="flex gap-2 hairline-b pb-2">
              {[1, 2, 3, 4].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveMealId(id)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeMealId === id
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  {profile.meals[id]?.nome || `Refeição 0${id}`}
                </button>
              ))}
            </div>

            {/* Editor da Refeição Ativa */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Nome da Refeição
                  </label>
                  <input
                    type="text"
                    value={currentMeal.nome}
                    onChange={(e) => updateMealField("nome", e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Horário Sugerido
                  </label>
                  <input
                    type="text"
                    value={currentMeal.horario}
                    onChange={(e) => updateMealField("horario", e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Opção A */}
              <div className="p-3 rounded border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-[11px]">Opção A</span>
                  <div className="flex gap-2 text-[10px] text-stone-500">
                    <span>
                      Cal:{" "}
                      <input
                        type="number"
                        className="w-14 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optA.cal}
                        onChange={(e) => updateMealOpt("optA", "cal", e.target.value)}
                      />
                    </span>
                    <span>
                      P:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optA.p}
                        onChange={(e) => updateMealOpt("optA", "p", e.target.value)}
                      />
                    </span>
                    <span>
                      C:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optA.c}
                        onChange={(e) => updateMealOpt("optA", "c", e.target.value)}
                      />
                    </span>
                    <span>
                      L:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optA.l}
                        onChange={(e) => updateMealOpt("optA", "l", e.target.value)}
                      />
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={currentMeal.optA.titulo}
                  onChange={(e) => updateMealOpt("optA", "titulo", e.target.value)}
                  placeholder="Título da Opção A"
                  className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 bg-white outline-none focus:border-stone-900"
                />
                <textarea
                  rows={4}
                  value={currentMeal.optA.itens.join("\n")}
                  onChange={(e) => updateMealItens("optA", e.target.value)}
                  placeholder="Alimentos linha a linha (use | para separar gramatura)"
                  className="w-full border border-stone-200 rounded p-1.5 font-mono text-[10.5px] text-stone-800 bg-white outline-none focus:border-stone-900"
                />
              </div>

              {/* Opção B */}
              <div className="p-3 rounded border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-[11px]">Opção B</span>
                  <div className="flex gap-2 text-[10px] text-stone-500">
                    <span>
                      Cal:{" "}
                      <input
                        type="number"
                        className="w-14 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optB.cal}
                        onChange={(e) => updateMealOpt("optB", "cal", e.target.value)}
                      />
                    </span>
                    <span>
                      P:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optB.p}
                        onChange={(e) => updateMealOpt("optB", "p", e.target.value)}
                      />
                    </span>
                    <span>
                      C:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optB.c}
                        onChange={(e) => updateMealOpt("optB", "c", e.target.value)}
                      />
                    </span>
                    <span>
                      L:{" "}
                      <input
                        type="number"
                        step="0.1"
                        className="w-11 p-0.5 border rounded text-right bg-white"
                        value={currentMeal.optB.l}
                        onChange={(e) => updateMealOpt("optB", "l", e.target.value)}
                      />
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={currentMeal.optB.titulo}
                  onChange={(e) => updateMealOpt("optB", "titulo", e.target.value)}
                  placeholder="Título da Opção B"
                  className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 bg-white outline-none focus:border-stone-900"
                />
                <textarea
                  rows={4}
                  value={currentMeal.optB.itens.join("\n")}
                  onChange={(e) => updateMealItens("optB", e.target.value)}
                  placeholder="Alimentos linha a linha (use | para separar gramatura)"
                  className="w-full border border-stone-200 rounded p-1.5 font-mono text-[10.5px] text-stone-800 bg-white outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: RECEITA */}
        {activeTab === "receita" && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
              Receituário Técnico em Destaque
            </h3>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Nome da Receita
              </label>
              <input
                type="text"
                value={profile.receita.nome}
                onChange={(e) =>
                  updateField("receita", { ...profile.receita, nome: e.target.value })
                }
                className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Rendimento & Tempo
              </label>
              <input
                type="text"
                value={profile.receita.rendimento}
                onChange={(e) =>
                  updateField("receita", { ...profile.receita, rendimento: e.target.value })
                }
                className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Ingredientes
              </label>
              <textarea
                rows={3}
                value={profile.receita.ingredientes}
                onChange={(e) =>
                  updateField("receita", { ...profile.receita, ingredientes: e.target.value })
                }
                className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Modo de Preparo
              </label>
              <textarea
                rows={3}
                value={profile.receita.preparo}
                onChange={(e) =>
                  updateField("receita", { ...profile.receita, preparo: e.target.value })
                }
                className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
          </div>
        )}

        {/* ABA 5: MICRONUTRIENTES */}
        {activeTab === "nutrientes" && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
              Demonstrativo de Micronutrientes
            </h3>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Ácidos Graxos & Fibras
              </label>
              <input
                type="text"
                value={profile.lipideosStr}
                onChange={(e) => updateField("lipideosStr", e.target.value)}
                className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Minerais & Eletrólitos
              </label>
              <input
                type="text"
                value={profile.mineraisStr}
                onChange={(e) => updateField("mineraisStr", e.target.value)}
                className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                Vitaminas
              </label>
              <input
                type="text"
                value={profile.vitaminasStr}
                onChange={(e) => updateField("vitaminasStr", e.target.value)}
                className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 outline-none focus:border-stone-900"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
