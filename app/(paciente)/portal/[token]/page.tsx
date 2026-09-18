"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Droplets,
  CheckCircle2,
  Circle,
  FileText,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Clock,
  Printer,
  Camera,
  Flame,
} from "lucide-react";
import {
  getStoredPatients,
  getStoredPlanProfile,
  getStoredDiary,
  addStoredDiaryEntry,
  PRACTITIONER_GABRIEL,
} from "@/lib/store";
import { Patient, PatientProfile, DiaryEntry } from "@/lib/types";

export default function PatientPortalPage() {
  const params = useParams();
  const token = (params?.token as string) || "pac-joao-freire";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  // Water tracker
  const [waterMl, setWaterMl] = useState(1750);
  const waterGoalMl = 2700;

  // Selected meal options state
  const [selectedOptions, setSelectedOptions] = useState<Record<number, "A" | "B">>({
    1: "A",
    2: "A",
    3: "B",
    4: "A",
  });

  // Completed meals state
  const [completedMeals, setCompletedMeals] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  // Completed supplements state
  const [completedSups, setCompletedSups] = useState<Record<string, boolean>>({
    "sup-1": true,
  });

  useEffect(() => {
    const all = getStoredPatients();
    const p = all.find((x) => x.id === token) || all[0];
    setPatient(p);
    setProfile(getStoredPlanProfile(p.id));
  }, [token]);

  const addWater = (amount: number) => {
    setWaterMl((prev) => Math.min(5000, prev + amount));
  };

  const toggleMealComplete = (mealId: number) => {
    const isNowDone = !completedMeals[mealId];
    setCompletedMeals((prev) => ({ ...prev, [mealId]: isNowDone }));

    if (isNowDone && patient) {
      const meal = profile?.meals[mealId];
      if (meal) {
        addStoredDiaryEntry({
          id: `diary-${Date.now()}`,
          pacienteId: patient.id,
          data: new Date().toLocaleDateString("pt-BR"),
          refeicaoId: mealId,
          refeicaoNome: meal.nome,
          status: "cumprida",
          opcaoEscolhida: selectedOptions[mealId] || "A",
          aguaConsumidaMl: waterMl,
          avaliacaoEstrelas: 5,
          notas: "Check-in realizado pelo app do paciente.",
        });
      }
    }
  };

  const toggleOption = (mealId: number, opt: "A" | "B") => {
    setSelectedOptions((prev) => ({ ...prev, [mealId]: opt }));
  };

  if (!patient || !profile) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        Carregando portal do paciente...
      </div>
    );
  }

  const waterPercent = Math.min(100, Math.round((waterMl / waterGoalMl) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Mobile Header */}
      <header className="bg-stone-900 text-white p-5 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 text-white font-serif font-bold text-xs flex items-center justify-center">
              JF
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                Olá, {patient.nome.split(" ")[0]}
              </div>
              <h1 className="text-sm font-bold leading-none mt-0.5 text-white">
                {patient.objetivo} · Fase 1
              </h1>
            </div>
          </div>

          <Link
            href={`/planos/${patient.id}?print=true`}
            target="_blank"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-medium transition-colors border border-stone-700"
          >
            <FileText className="w-3 h-3 text-stone-300" />
            <span>Ver PDF A4</span>
          </Link>
        </div>

        {/* Streak & Adherence Badge */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="w-4 h-4 fill-current" />
            <span>{patient.streakDias} dias seguidos</span>
          </div>
          <div className="text-stone-300">
            Aderência: <strong className="text-emerald-400 font-bold">{patient.adesaoMedia7d}%</strong>
          </div>
          <div className="text-stone-400 text-[10px]">
            Meta: {profile.calorias} kcal
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 space-y-4 flex-1">
        {/* Tracker de Água Interativo */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900">
                  Ingestão de Água Diária
                </h3>
                <div className="text-[10px] text-stone-400 font-mono">
                  Meta: {profile.agua} ({waterGoalMl} ml)
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold font-mono text-stone-900">
                {waterMl}
              </span>
              <span className="text-[10px] text-stone-400 font-mono"> / {waterGoalMl} ml</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden my-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => addWater(250)}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer"
            >
              + 250 ml (1 copo)
            </button>
            <button
              onClick={() => addWater(500)}
              className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors text-center cursor-pointer"
            >
              + 500 ml (1 garrafa)
            </button>
          </div>
        </div>

        {/* Refeições de Hoje (Checklist Interativo) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              Refeições de Hoje
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">
              {Object.values(completedMeals).filter(Boolean).length} de 4 realizadas
            </span>
          </div>

          {Object.values(profile.meals).map((meal) => {
            const isDone = completedMeals[meal.id] || false;
            const currentOptKey = selectedOptions[meal.id] || "A";
            const currentOpt = currentOptKey === "A" ? meal.optA : meal.optB;

            return (
              <div
                key={meal.id}
                className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-stone-200"
                }`}
              >
                {/* Meal Card Top */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      {meal.horario}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900">
                      {meal.nome}
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleMealComplete(meal.id)}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Consumida</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Marcar Feito</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option A / B Switcher */}
                <div className="flex items-center gap-1.5 my-2.5 bg-stone-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => toggleOption(meal.id, "A")}
                    className={`flex-1 py-1 rounded-md font-medium text-center transition-all cursor-pointer ${
                      currentOptKey === "A"
                        ? "bg-white text-stone-900 shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Opção A ({meal.optA.cal} kcal)
                  </button>
                  <button
                    onClick={() => toggleOption(meal.id, "B")}
                    className={`flex-1 py-1 rounded-md font-medium text-center transition-all cursor-pointer ${
                      currentOptKey === "B"
                        ? "bg-white text-stone-900 shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Opção B ({meal.optB.cal} kcal)
                  </button>
                </div>

                {/* Selected Option Content */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold text-stone-800 text-[11px]">
                    {currentOpt.titulo}
                  </div>
                  <ul className="space-y-1 text-stone-600">
                    {currentOpt.itens.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-stone-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 text-[10px] text-stone-400 font-mono flex items-center justify-between">
                    <span>
                      Macros: P:{currentOpt.p}g · C:{currentOpt.c}g · L:{currentOpt.l}g
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suplementos do Dia */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Suplementação Prescrita
          </h3>

          <div className="space-y-2">
            {profile.suplementos.map((sup, idx) => {
              const checked = completedSups[sup.id || idx] || false;
              return (
                <div
                  key={sup.id || idx}
                  onClick={() =>
                    setCompletedSups((prev) => ({
                      ...prev,
                      [sup.id || idx]: !checked,
                    }))
                  }
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    checked
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-400" />
                    )}
                    <div>
                      <div className="font-bold text-stone-900 text-xs">
                        {sup.nome}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {sup.posologia}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-stone-400">
                    {checked ? "Tomado" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contato & Dúvidas */}
        <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-sm space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">
                {PRACTITIONER_GABRIEL.nome}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                {PRACTITIONER_GABRIEL.crn}
              </div>
            </div>
            <a
              href={`https://wa.me/5511987654321?text=Olá Gabriel, tenho uma dúvida sobre meu plano alimentar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
