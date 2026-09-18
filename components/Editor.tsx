"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DayTotals, FoodIndex } from "@/lib/nutrition";
import type { Issue } from "@/lib/validate";
import type { PatientProfile } from "@/lib/types";
import GoalPanel from "./GoalPanel";
import StepExtras from "./steps/StepExtras";
import StepIdentificacao from "./steps/StepIdentificacao";
import StepMetas from "./steps/StepMetas";
import StepRefeicoes from "./steps/StepRefeicoes";
import StepRevisao from "./steps/StepRevisao";

const STEPS = ["Paciente", "Metas", "Refeições", "Suplementos e receita", "Revisão"] as const;

interface Props {
  profile: PatientProfile;
  onChange: (p: PatientProfile) => void;
  index: FoodIndex;
  totals: DayTotals;
  issues: Issue[];
  favoritos: Map<number, number>;
  onFoodUsed: (id: number) => void;
  saved: boolean | null;
  onSave: () => void;
  onPrint: () => void;
  /** Nome do paciente vem do cadastro (somente leitura). */
  lockName?: boolean;
}

export default function Editor(p: Props) {
  const [step, setStep] = useState(0);
  const erros = p.issues.filter((i) => i.nivel === "erro").length;
  const avisos = p.issues.length - erros;

  return (
    <aside className="no-print w-full md:w-[48%] lg:w-[45%] bg-white border-r border-stone-200 flex flex-col shrink-0 min-h-0">
      <nav className="flex items-center border-b border-stone-200 px-3 text-xs font-medium text-stone-500 overflow-x-auto shrink-0 bg-stone-50/50">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`py-2.5 px-2.5 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              step === i ? "border-stone-900 text-stone-900 font-semibold" : "border-transparent hover:text-stone-900"
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${step === i ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-600"}`}>{i + 1}</span>
            {label}
            {i === 4 && p.issues.length > 0 && (
              <span className={`text-[9px] px-1 rounded ${erros ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{erros || avisos}</span>
            )}
          </button>
        ))}
      </nav>

      <GoalPanel profile={p.profile} totals={p.totals} />

      <div className="flex-1 overflow-y-auto p-5 text-xs">
        {step === 0 && <StepIdentificacao profile={p.profile} onChange={p.onChange} lockName={p.lockName} />}
        {step === 1 && <StepMetas profile={p.profile} onChange={p.onChange} />}
        {step === 2 && <StepRefeicoes profile={p.profile} onChange={p.onChange} favoritos={p.favoritos} onFoodUsed={p.onFoodUsed} />}
        {step === 3 && <StepExtras profile={p.profile} onChange={p.onChange} nutrientes={p.totals.nutrientes} />}
        {step === 4 && (
          <StepRevisao profile={p.profile} index={p.index} totals={p.totals} issues={p.issues} saved={p.saved} onSave={p.onSave} onPrint={p.onPrint} />
        )}
      </div>

      <div className="shrink-0 border-t border-stone-200 px-4 py-2 flex justify-between bg-stone-50/50">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-xs text-stone-600 disabled:opacity-30 flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> {step > 0 ? STEPS[step - 1] : ""}
        </button>
        <button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)} className="text-xs font-medium text-stone-900 disabled:opacity-30 flex items-center gap-1">
          {step < STEPS.length - 1 ? STEPS[step + 1] : ""} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
