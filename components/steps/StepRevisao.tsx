"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Printer, Save, XCircle } from "lucide-react";
import { optionTotals, type DayTotals, type FoodIndex } from "@/lib/nutrition";
import { fmt } from "@/lib/report";
import type { Issue } from "@/lib/validate";
import type { PatientProfile } from "@/lib/types";
import { SectionTitle } from "../ui";

interface Props {
  profile: PatientProfile;
  index: FoodIndex;
  totals: DayTotals;
  issues: Issue[];
  saved: boolean | null;
  onSave: () => void;
  onPrint: () => void;
}

export default function StepRevisao({ profile, index, totals, issues, saved, onSave, onPrint }: Props) {
  const erros = issues.filter((i) => i.nivel === "erro");
  const avisos = issues.filter((i) => i.nivel === "aviso");

  return (
    <div className="space-y-4">
      <section>
        <SectionTitle>Conferência do plano</SectionTitle>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Sem pendências: metas, refeições e restrições conferem.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {[...erros, ...avisos].map((i, n) => (
              <li key={n} className={`flex items-start gap-2 rounded border px-3 py-1.5 text-xs ${i.nivel === "erro" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {i.nivel === "erro" ? <XCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {i.mensagem}
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-stone-400 mt-1.5">Pendências não impedem a impressão: a decisão clínica é do profissional.</p>
      </section>

      <section>
        <SectionTitle>Resumo por refeição</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border border-stone-200 tabular-nums">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400">
              <tr><th className="text-left p-1.5">Refeição</th><th className="p-1.5">kcal</th><th className="p-1.5">P</th><th className="p-1.5">C</th><th className="p-1.5">L</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {profile.meals.flatMap((m) =>
                m.opcoes.map((o, idx) => {
                  const t = optionTotals(o, index).macros;
                  return (
                    <tr key={o.id}>
                      <td className="p-1.5">{idx === 0 ? <b>{m.nome}</b> : null} <span className="text-stone-400">{o.titulo}</span></td>
                      <td className="p-1.5 text-center">{fmt(t.kcal, 0)}</td>
                      <td className="p-1.5 text-center">{fmt(t.p)}</td>
                      <td className="p-1.5 text-center">{fmt(t.c)}</td>
                      <td className="p-1.5 text-center">{fmt(t.l)}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
            <tfoot className="bg-stone-50 font-semibold">
              <tr>
                <td className="p-1.5">Média diária planejada</td>
                <td className="p-1.5 text-center">{fmt(totals.media.kcal, 0)}</td>
                <td className="p-1.5 text-center">{fmt(totals.media.p)}</td>
                <td className="p-1.5 text-center">{fmt(totals.media.c)}</td>
                <td className="p-1.5 text-center">{fmt(totals.media.l)}</td>
              </tr>
              <tr className="text-stone-500 font-normal">
                <td className="p-1.5">Meta</td>
                <td className="p-1.5 text-center">{fmt(profile.calorias, 0)}</td>
                <td className="p-1.5 text-center">{fmt(profile.prot)}</td>
                <td className="p-1.5 text-center">{fmt(profile.carbo)}</td>
                <td className="p-1.5 text-center">{fmt(profile.gord)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={onSave} className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 text-xs rounded flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" aria-hidden="true" /> Salvar agora
        </button>
        <button onClick={onPrint} className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Imprimir / Exportar PDF
        </button>
        {saved === true && <span className="text-[11px] text-emerald-700">Plano salvo neste navegador.</span>}
        {saved === false && <span className="text-[11px] text-red-700">Não foi possível salvar (armazenamento cheio ou bloqueado). Use “Salvar JSON”.</span>}
      </div>
    </div>
  );
}
