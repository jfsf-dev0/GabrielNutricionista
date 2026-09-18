"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Save,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Users,
  Search,
  Plus,
  Trash2,
  Apple,
  CheckCircle2,
  Activity,
  ArrowLeft,
} from "lucide-react";
import {
  getStoredPatients,
  getStoredPlanProfile,
  saveStoredPlanProfile,
  PRACTITIONER_GABRIEL,
} from "@/lib/store";
import { defaultProfile } from "@/lib/defaultProfile";
import { Patient, PatientProfile } from "@/lib/types";
import ReportPreview from "@/components/ReportPreview";
import TacoSearchModal from "@/components/TacoSearchModal";

export default function PlanBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = (params?.id as string) || "pac-joao-freire";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [activeTab, setActiveTab] = useState<"metas" | "refeicoes" | "suplementos" | "receita" | "micronutrientes">("refeicoes");
  const [activeMealId, setActiveMealId] = useState<number>(1);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // TACO Search Modal state
  const [isTacoOpen, setIsTacoOpen] = useState(false);
  const [tacoTargetOption, setTacoTargetOption] = useState<"A" | "B">("A");

  useEffect(() => {
    const all = getStoredPatients();
    setPatients(all);
    const loaded = getStoredPlanProfile(patientId);
    setProfile(loaded);
  }, [patientId]);

  useEffect(() => {
    if (searchParams.get("print") === "true") {
      setTimeout(() => window.print(), 500);
    }
  }, [searchParams]);

  const updateField = <K extends keyof PatientProfile>(field: K, value: PatientProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveStoredPlanProfile(patientId, profile);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Suplementos
  const handleAddSupplement = () => {
    const newSup = {
      id: `sup-${Date.now()}`,
      nome: "Novo Composto",
      posologia: "1 dose/dia",
      obs: "Diretriz clínica a ser seguida pelo paciente.",
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
        [field]: value,
      },
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
          [field]: field === "titulo" ? value : Number(value) || 0,
        },
      },
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
          itens: lines,
        },
      },
    };
    updateField("meals", updatedMeals);
  };

  const handleAddTacoFood = (
    formattedLine: string,
    macros: { cal: number; p: number; c: number; l: number }
  ) => {
    const currentOpt = tacoTargetOption === "A" ? currentMeal.optA : currentMeal.optB;
    const newItens = [...currentOpt.itens, formattedLine];
    const newCal = currentOpt.cal + macros.cal;
    const newP = Number((currentOpt.p + macros.p).toFixed(1));
    const newC = Number((currentOpt.c + macros.c).toFixed(1));
    const newL = Number((currentOpt.l + macros.l).toFixed(1));

    const updatedMeals = {
      ...profile.meals,
      [activeMealId]: {
        ...currentMeal,
        [tacoTargetOption === "A" ? "optA" : "optB"]: {
          ...currentOpt,
          cal: newCal,
          p: newP,
          c: newC,
          l: newL,
          itens: newItens,
        },
      },
    };
    updateField("meals", updatedMeals);
  };

  // Cálculo consolidado das 4 refeições (Média de Opção A e B)
  const calcTotals = () => {
    let totalCal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalL = 0;
    const mealsList = Object.values(profile.meals);

    mealsList.forEach((m) => {
      // Média entre Opção A e B
      const calAvg = (m.optA.cal + m.optB.cal) / 2;
      const pAvg = (m.optA.p + m.optB.p) / 2;
      const cAvg = (m.optA.c + m.optB.c) / 2;
      const lAvg = (m.optA.l + m.optB.l) / 2;

      totalCal += calAvg;
      totalP += pAvg;
      totalC += cAvg;
      totalL += lAvg;
    });

    return {
      cal: Math.round(totalCal),
      p: Number(totalP.toFixed(1)),
      c: Number(totalC.toFixed(1)),
      l: Number(totalL.toFixed(1)),
    };
  };

  const calculated = calcTotals();
  const currentPatient = patients.find((p) => p.id === patientId);

  return (
    <div className="h-full flex flex-col overflow-hidden -m-6">
      {/* Top Header / Action Bar */}
      <header className="no-print h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            href={`/pacientes/${patientId}`}
            className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition-colors"
            title="Voltar para ficha do paciente"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Construtor de Planos Nutricionais (W3)
              </h1>
              <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                Paciente: {profile.paciente}
              </span>
            </div>
            <div className="text-[10px] text-stone-400">
              Split-view em tempo real · Banco TACO integrado · Dossiê Editorial A4 (9pt)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Patient Quick Switcher */}
          <select
            value={patientId}
            onChange={(e) => router.push(`/planos/${e.target.value}`)}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs px-2.5 py-1.5 rounded-lg focus:outline-hidden"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.dadosAntropometricos.peso} kg)
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-stone-600" />
            <span>{isSavedNotice ? "Salvo no Prontuário!" : "Salvar Alterações"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer ml-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF A4 (9pt)</span>
          </button>
        </div>
      </header>

      {/* Real-time Macro Balancer Strip (Discovery W3) */}
      <div className="no-print bg-stone-900 text-white px-6 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 text-xs shrink-0 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">
              Meta Calórica:
            </span>
            <span className="font-bold text-sm font-mono text-white">
              {profile.calorias} kcal
            </span>
            <span className="text-[10px] text-stone-400">
              (Calculado: <strong className="text-emerald-400 font-mono">{calculated.cal} kcal</strong>)
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-300 font-mono text-[11px]">
            <div>
              <span className="text-stone-500">P: </span>
              <strong className="text-white">{profile.prot}g</strong>
              <span className="text-[10px] text-stone-400 ml-1">
                ({currentPatient ? (profile.prot / currentPatient.dadosAntropometricos.peso).toFixed(1) : 2.2}g/kg)
              </span>
            </div>
            <div>
              <span className="text-stone-500">C: </span>
              <strong className="text-white">{profile.carbo}g</strong>
              <span className="text-[10px] text-stone-400 ml-1">(41%)</span>
            </div>
            <div>
              <span className="text-stone-500">L: </span>
              <strong className="text-white">{profile.gord}g</strong>
              <span className="text-[10px] text-stone-400 ml-1">(29%)</span>
            </div>
            <div>
              <span className="text-stone-500">Fibras: </span>
              <strong className="text-white">{profile.fibras}g</strong>
            </div>
            <div>
              <span className="text-stone-500">Água: </span>
              <strong className="text-white">{profile.agua}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-mono flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Balanço Calórico Equilibrado</span>
          </span>
        </div>
      </div>

      {/* Main Split-View Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Meal & Food Constructor */}
        <aside className="no-print w-full md:w-[48%] lg:w-[45%] bg-white border-r border-stone-200 flex flex-col shrink-0">
          {/* Subtabs */}
          <div className="flex items-center border-b border-stone-200 px-4 text-xs font-medium text-stone-500 overflow-x-auto shrink-0 bg-stone-50/50">
            <button
              onClick={() => setActiveTab("metas")}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "metas"
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent hover:text-stone-900"
              }`}
            >
              01. Identificação & Metas
            </button>
            <button
              onClick={() => setActiveTab("refeicoes")}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "refeicoes"
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent hover:text-stone-900"
              }`}
            >
              02. Refeições & Alimentos TACO
            </button>
            <button
              onClick={() => setActiveTab("suplementos")}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "suplementos"
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent hover:text-stone-900"
              }`}
            >
              03. Suplementação
            </button>
            <button
              onClick={() => setActiveTab("receita")}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "receita"
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent hover:text-stone-900"
              }`}
            >
              04. Receituário
            </button>
            <button
              onClick={() => setActiveTab("micronutrientes")}
              className={`py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "micronutrientes"
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent hover:text-stone-900"
              }`}
            >
              05. Micronutrientes
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* SUBTAB 1: Identificação & Metas */}
            {activeTab === "metas" && (
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
                      className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                      className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                      className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                      Meta Hídrica (ml/kg)
                    </label>
                    <input
                      type="text"
                      value={profile.agua}
                      onChange={(e) => updateField("agua", e.target.value)}
                      className="w-full border border-stone-200 rounded p-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800 mb-2">
                    Metas Energéticas & Fracionamento
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: REFEIÇÕES & ALIMENTOS TACO */}
            {activeTab === "refeicoes" && (
              <div className="space-y-4">
                {/* Meal Select Buttons */}
                <div className="flex gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto">
                  {[1, 2, 3, 4].map((id) => (
                    <button
                      key={id}
                      onClick={() => setActiveMealId(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        activeMealId === id
                          ? "bg-stone-900 text-white shadow-2xs"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                      }`}
                    >
                      {profile.meals[id]?.nome || `Refeição 0${id}`}
                    </button>
                  ))}
                </div>

                {/* Active Meal Controls */}
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  </div>

                  {/* OPÇÃO A */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">Opção A</span>
                        <button
                          onClick={() => {
                            setTacoTargetOption("A");
                            setIsTacoOpen(true);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 bg-stone-900 text-white rounded text-[10px] font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Apple className="w-3 h-3 text-amber-300" />
                          <span>+ Buscar Alimento TACO</span>
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] text-stone-500 font-mono">
                        <span>Cal: <strong>{currentMeal.optA.cal}</strong></span>
                        <span>P: <strong>{currentMeal.optA.p}g</strong></span>
                        <span>C: <strong>{currentMeal.optA.c}g</strong></span>
                        <span>L: <strong>{currentMeal.optA.l}g</strong></span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={currentMeal.optA.titulo}
                      onChange={(e) => updateMealOpt("optA", "titulo", e.target.value)}
                      placeholder="Título da Opção A"
                      className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 bg-white focus:outline-hidden focus:border-stone-900"
                    />

                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">
                        Itens da Refeição (um por linha · separe gramas com |)
                      </label>
                      <textarea
                        rows={4}
                        value={currentMeal.optA.itens.join("\n")}
                        onChange={(e) => updateMealItens("optA", e.target.value)}
                        placeholder="ex: Peito de Frango Grelhado | 150 g"
                        className="w-full border border-stone-200 rounded p-2 font-mono text-[11px] text-stone-800 bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  </div>

                  {/* OPÇÃO B */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">Opção B</span>
                        <button
                          onClick={() => {
                            setTacoTargetOption("B");
                            setIsTacoOpen(true);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 bg-stone-900 text-white rounded text-[10px] font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Apple className="w-3 h-3 text-amber-300" />
                          <span>+ Buscar Alimento TACO</span>
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] text-stone-500 font-mono">
                        <span>Cal: <strong>{currentMeal.optB.cal}</strong></span>
                        <span>P: <strong>{currentMeal.optB.p}g</strong></span>
                        <span>C: <strong>{currentMeal.optB.c}g</strong></span>
                        <span>L: <strong>{currentMeal.optB.l}g</strong></span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={currentMeal.optB.titulo}
                      onChange={(e) => updateMealOpt("optB", "titulo", e.target.value)}
                      placeholder="Título da Opção B"
                      className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 bg-white focus:outline-hidden focus:border-stone-900"
                    />

                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">
                        Itens da Refeição (um por linha · separe gramas com |)
                      </label>
                      <textarea
                        rows={4}
                        value={currentMeal.optB.itens.join("\n")}
                        onChange={(e) => updateMealItens("optB", e.target.value)}
                        placeholder="ex: Filé de Tilápia Grelhado | 160 g"
                        className="w-full border border-stone-200 rounded p-2 font-mono text-[11px] text-stone-800 bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: SUPLEMENTAÇÃO */}
            {activeTab === "suplementos" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                    Conduta Clínica & Suplementação
                  </h3>
                  <button
                    onClick={handleAddSupplement}
                    className="text-xs text-stone-900 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {profile.suplementos.map((sup, idx) => (
                    <div
                      key={sup.id || idx}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sup.nome}
                          onChange={(e) => handleUpdateSupplement(idx, "nome", e.target.value)}
                          placeholder="Nome do Composto"
                          className="font-medium text-stone-900 bg-transparent text-xs w-[70%] focus:outline-hidden"
                        />
                        <button
                          onClick={() => handleRemoveSupplement(idx)}
                          className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer"
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
                        className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-800 bg-white focus:outline-hidden focus:border-stone-900"
                      />
                      <textarea
                        rows={2}
                        value={sup.obs}
                        onChange={(e) => handleUpdateSupplement(idx, "obs", e.target.value)}
                        placeholder="Diretriz técnica / Observação"
                        className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-700 bg-white focus:outline-hidden focus:border-stone-900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 4: RECEITUÁRIO */}
            {activeTab === "receita" && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                  Receita Técnica em Destaque
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
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 font-mono text-[11px]"
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
                    className="w-full border border-stone-200 rounded p-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>
            )}

            {/* SUBTAB 5: MICRONUTRIENTES */}
            {activeTab === "micronutrientes" && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                  Demonstrativo de Micronutrientes (Matriz Técnica)
                </h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                    Ácidos Graxos & Fibras
                  </label>
                  <input
                    type="text"
                    value={profile.lipideosStr}
                    onChange={(e) => updateField("lipideosStr", e.target.value)}
                    className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                    className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 focus:outline-hidden focus:border-stone-900"
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
                    className="w-full border border-stone-200 rounded p-1.5 text-[11px] text-stone-900 focus:outline-hidden focus:border-stone-900"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE: Live Preview Editorial A4 (9pt) */}
        <div className="flex-1 overflow-y-auto bg-stone-200/60 p-4 md:p-6 flex flex-col items-center">
          <ReportPreview profile={profile} />
        </div>
      </div>

      {/* TACO Search Modal */}
      <TacoSearchModal
        isOpen={isTacoOpen}
        onClose={() => setIsTacoOpen(false)}
        onAddFood={handleAddTacoFood}
        targetMealName={currentMeal.nome}
        targetOption={tacoTargetOption}
      />
    </div>
  );
}
