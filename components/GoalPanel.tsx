"use client";

import React from "react";
import { goalBalance, type DayTotals } from "@/lib/nutrition";
import { fmt } from "@/lib/report";
import type { PatientProfile } from "@/lib/types";

const ROWS = [
  { k: "kcal", label: "kcal", dec: 0 },
  { k: "p", label: "Prot.", dec: 1 },
  { k: "c", label: "Carb.", dec: 1 },
  { k: "l", label: "Lip.", dec: 1 },
] as const;

/** Faixa fixa "meta × planejado" visível em todos os passos. */
export default function GoalPanel({ profile, totals }: { profile: PatientProfile; totals: DayTotals }) {
  const bal = goalBalance(profile, totals.media);
  const variavel = totals.min.kcal !== totals.max.kcal;
  return (
    <div className="no-print border-b border-stone-200 bg-stone-50 px-4 py-2 shrink-0">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Meta × Planejado (média das opções)</span>
        {variavel && (
          <span className="text-[10px] text-stone-400 tabular-nums">
            faixa {fmt(totals.min.kcal, 0)}–{fmt(totals.max.kcal, 0)} kcal
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ROWS.map(({ k, label, dec }) => {
          const b = bal[k];
          const abs = Math.abs(b.desvioPct);
          const cor = b.meta <= 0 ? "bg-stone-300" : abs < 5 ? "bg-emerald-500" : abs < 10 ? "bg-amber-500" : "bg-red-500";
          const pct = b.meta > 0 ? Math.min(100, (b.planejado / b.meta) * 100) : 0;
          return (
            <div key={k} title={b.saldo >= 0 ? `Faltam ${fmt(b.saldo, dec)}` : `Passou ${fmt(-b.saldo, dec)}`}>
              <div className="flex justify-between text-[10px] text-stone-600 tabular-nums">
                <span className="font-medium">{label}</span>
                <span>{fmt(b.planejado, dec)}/{fmt(b.meta, dec)}</span>
              </div>
              <div className="h-1.5 rounded bg-stone-200 overflow-hidden">
                <div className={`h-full ${cor}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[9.5px] text-stone-400 tabular-nums">
                {b.saldo >= 0 ? `faltam ${fmt(b.saldo, dec)}` : `+${fmt(-b.saldo, dec)} acima`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
