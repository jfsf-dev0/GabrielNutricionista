"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  Calculator,
  Activity,
  Flame,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  calcMifflinStJeor,
  calcHarrisBenedict,
  calcCunningham,
  calcGET,
  calcIMC,
  calcJacksonPollock3,
  calcBodyComposition,
  planMacros,
  ACTIVITY_FACTORS,
  ActivityLevel,
} from "@/lib/calc";
import { getStoredPatients } from "@/lib/store";
import { Patient } from "@/lib/types";

export default function AssessmentsCalculatorPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // Metabolic inputs
  const [peso, setPeso] = useState<number>(76.5);
  const [altura, setAltura] = useState<number>(178);
  const [idade, setIdade] = useState<number>(29);
  const [genero, setGenero] = useState<"M" | "F">("M");
  const [atividade, setAtividade] = useState<ActivityLevel>("moderado");
  const [caloriasAlvo, setCaloriasAlvo] = useState<number>(2268);

  // Jackson & Pollock 3 Dobras
  const [d1, setD1] = useState<number>(7.0); // Peitoral (M) ou Tríceps (F)
  const [d2, setD2] = useState<number>(14.0); // Abdominal (M) ou Supra-ilíaca (F)
  const [d3, setD3] = useState<number>(11.0); // Coxa

  useEffect(() => {
    const pats = getStoredPatients();
    setPatients(pats);
    if (pats.length > 0) {
      setSelectedPatientId(pats[0].id);
      loadPatientData(pats[0]);
    }
  }, []);

  const loadPatientData = (p: Patient) => {
    setPeso(p.dadosAntropometricos.peso);
    setAltura(p.dadosAntropometricos.altura);
    setIdade(p.idade);
    setGenero(p.genero);
    if (p.dadosAntropometricos.dobras) {
      if (p.genero === "M") {
        setD1(p.dadosAntropometricos.dobras.peitoral || 7);
        setD2(p.dadosAntropometricos.dobras.abdominal || 14);
        setD3(p.dadosAntropometricos.dobras.coxa || 11);
      } else {
        setD1(p.dadosAntropometricos.dobras.triceps || 15);
        setD2(p.dadosAntropometricos.dobras.suprailiaca || 17);
        setD3(p.dadosAntropometricos.dobras.coxa || 20);
      }
    }
  };

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    const p = patients.find((x) => x.id === id);
    if (p) loadPatientData(p);
  };

  // Calculations
  const imcData = calcIMC(peso, altura);
  const tmbMifflin = calcMifflinStJeor({ pesoKg: peso, alturaCm: altura, idadeAnos: idade, genero });
  const tmbHarris = calcHarrisBenedict({ pesoKg: peso, alturaCm: altura, idadeAnos: idade, genero });
  const getCalculated = calcGET(tmbMifflin, atividade);

  // Body Fat
  const percentualGordura = calcJacksonPollock3(genero, idade, { d1, d2, d3 });
  const bodyComp = calcBodyComposition(peso, percentualGordura);
  const tmbCunningham = calcCunningham(bodyComp.massaMagraKg);

  // Macros
  const macros = planMacros({
    pesoKg: peso,
    caloriasAlvo: caloriasAlvo,
    protGPorKg: 2.2,
    gordGPorKg: 1.0,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Avaliação Antropométrica & Cálculos Metabólicos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Módulos M3 e M4: Fórmulas de TMB (Mifflin, Harris-Benedict, Cunningham), GET, Dobras de Jackson-Pollock e Metas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Carregar Paciente:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientChange(e.target.value)}
            className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-medium focus:outline-hidden"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.dadosAntropometricos.peso} kg)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Input & Jackson Pollock */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card: Dados Básicos */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-stone-500" />
              <span>Dados Biométricos do Paciente</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-stone-500 font-medium mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-stone-500 font-medium mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={altura}
                  onChange={(e) => setAltura(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-stone-500 font-medium mb-1">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  value={idade}
                  onChange={(e) => setIdade(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-stone-500 font-medium mb-1">
                  Gênero
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as "M" | "F")}
                  className="w-full border border-stone-300 rounded p-1.5 text-xs text-stone-900 outline-none"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-stone-500 font-medium mb-1">
                Fator de Atividade Física (GET)
              </label>
              <select
                value={atividade}
                onChange={(e) => setAtividade(e.target.value as ActivityLevel)}
                className="w-full border border-stone-300 rounded p-2 text-xs text-stone-900 outline-none"
              >
                {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({v.factor}x) — {v.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card: Dobras de Jackson & Pollock 3 */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-stone-500" />
                <span>Protocolo Jackson & Pollock (3 Dobras)</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                {genero === "M" ? "Peitoral / Abdômen / Coxa" : "Tríceps / Supra-ilíaca / Coxa"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-1">
                  {genero === "M" ? "1. Peitoral (mm)" : "1. Tríceps (mm)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={d1}
                  onChange={(e) => setD1(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-1">
                  {genero === "M" ? "2. Abdominal (mm)" : "2. Supra-ilíaca (mm)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={d2}
                  onChange={(e) => setD2(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-stone-600 mb-1">
                  3. Coxa Anterior (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={d3}
                  onChange={(e) => setD3(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded p-1.5 font-mono font-bold text-stone-900 outline-none"
                />
              </div>
            </div>

            {/* Resultado Composição Corporal */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 grid grid-cols-3 gap-3 text-center font-mono">
              <div>
                <div className="text-[10px] text-stone-400">% de Gordura</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">
                  {percentualGordura}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Massa Magra</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">
                  {bodyComp.massaMagraKg} kg
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Massa Gorda</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">
                  {bodyComp.massaGordaKg} kg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Metabolic Formulas & Macro Planner */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card: TMB Comparativa */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Comparativo de Fórmulas Metabólicas (TMB)</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="text-[10px] text-stone-400 font-sans">Mifflin-St Jeor</div>
                <div className="text-lg font-bold text-stone-900 mt-1">
                  {tmbMifflin}
                </div>
                <div className="text-[9px] text-stone-400">kcal/dia</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="text-[10px] text-stone-400 font-sans">Harris-Benedict</div>
                <div className="text-lg font-bold text-stone-900 mt-1">
                  {tmbHarris}
                </div>
                <div className="text-[9px] text-stone-400">kcal/dia</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="text-[10px] text-stone-400 font-sans">Cunningham (MLG)</div>
                <div className="text-lg font-bold text-stone-900 mt-1">
                  {tmbCunningham}
                </div>
                <div className="text-[9px] text-stone-400">kcal/dia</div>
              </div>
            </div>

            <div className="p-3 bg-stone-900 text-white rounded-xl flex items-center justify-between font-mono">
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-sans">
                  Gasto Energético Total (GET)
                </div>
                <div className="text-2xl font-bold">
                  {getCalculated} kcal
                </div>
              </div>
              <div className="text-right text-[11px] text-stone-400 font-sans">
                Base TMB Mifflin × {ACTIVITY_FACTORS[atividade].factor}
              </div>
            </div>
          </div>

          {/* Card: Planejador de Metas de Macronutrientes */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-stone-500" />
                <span>Distribuição de Macronutrientes para Prescrição</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-600 font-medium">Meta Calórica Alvo:</span>
              <input
                type="number"
                value={caloriasAlvo}
                onChange={(e) => setCaloriasAlvo(Number(e.target.value))}
                className="w-28 border border-stone-300 rounded p-1 text-xs font-mono font-bold text-stone-900 outline-none"
              />
              <span className="text-xs text-stone-500">kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-400 font-sans">Proteínas (2.2g/kg)</div>
                <div className="text-base font-bold text-stone-900 mt-0.5">{macros.protG}g</div>
                <div className="text-[10px] text-stone-500">{macros.protPct}% kcal</div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-400 font-sans">Carboidratos</div>
                <div className="text-base font-bold text-stone-900 mt-0.5">{macros.carboG}g</div>
                <div className="text-[10px] text-stone-500">{macros.carboPct}% kcal</div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-400 font-sans">Lipídios (1.0g/kg)</div>
                <div className="text-base font-bold text-stone-900 mt-0.5">{macros.gordG}g</div>
                <div className="text-[10px] text-stone-500">{macros.gordPct}% kcal</div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>Fibras Recomendadas: <strong>{macros.fibrasG}g</strong></span>
              <span>Hidratação Mínima: <strong>{macros.aguaLitros} L/dia</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
