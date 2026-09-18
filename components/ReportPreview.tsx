"use client";

import React from "react";
import { macroPercents, optionTotals, type DayTotals, type FoodIndex } from "@/lib/nutrition";
import { fmt, itemQty, microGroups } from "@/lib/report";
import type { Meal, MealOption, PatientProfile } from "@/lib/types";

interface ReportPreviewProps {
  profile: PatientProfile;
  index: FoodIndex;
  totals: DayTotals;
}

const sectionTitle = "text-[7.5pt] tracking-[0.18em] uppercase text-stone-400 font-semibold";

function OptionColumn({ option, index, first }: { option: MealOption; index: FoodIndex; first: boolean }) {
  const t = optionTotals(option, index).macros;
  return (
    <div className={first ? "pr-2" : "pl-2 border-l border-stone-200"}>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-medium text-stone-900">{option.titulo}</span>
        <span className="text-[7.2pt] text-stone-500 tabular-nums">{fmt(t.kcal, 0)} kcal</span>
      </div>
      <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
        P: {fmt(t.p)}g · C: {fmt(t.c)}g · L: {fmt(t.l)}g
      </div>
      <ul className="space-y-0.5 text-stone-700">
        {option.itens.map((it) =>
          it.nota ? (
            <li key={it.id} className="text-[7pt] text-stone-500 pl-2 border-l border-stone-200">{it.nome}</li>
          ) : (
            <li key={it.id} className="flex justify-between gap-2">
              <span>{it.nome}</span>
              <span className="font-medium text-right whitespace-nowrap">{itemQty(it)}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function MealBlock({ meal, index }: { meal: Meal; index: FoodIndex }) {
  const opcoes = meal.opcoes.filter((o) => o.itens.length > 0 || !optionTotals(o, index).vazia);
  if (opcoes.length === 0) return null;
  const kcals = opcoes.map((o) => optionTotals(o, index).macros.kcal);
  const min = Math.min(...kcals), max = Math.max(...kcals);
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-baseline hairline-b pb-0.5 mb-1.5 text-[8.2pt]">
        <span className="font-semibold text-stone-900">
          {meal.nome} &nbsp;
          {meal.horario && <span className="text-stone-400 font-normal text-[7.2pt]">· Sugerido: {meal.horario}</span>}
        </span>
        <span className="text-[7.2pt] text-stone-500 tabular-nums">
          {Math.round(min) === Math.round(max) ? `~${fmt(min, 0)} kcal` : `~${fmt(min, 0)} a ${fmt(max, 0)} kcal`}
        </span>
      </div>
      <div
        className="grid gap-3 text-[8pt] leading-[11pt]"
        style={{ gridTemplateColumns: `repeat(${Math.min(opcoes.length, 3)}, minmax(0, 1fr))` }}
      >
        {opcoes.map((o, i) => (
          <OptionColumn key={o.id} option={o} index={index} first={i % 3 === 0} />
        ))}
      </div>
    </div>
  );
}

function MicroLine({ label, text, className = "" }: { label: string; text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={className}>
      <b>{label}:</b> {text}
    </div>
  );
}

export default function ReportPreview({ profile, index, totals }: ReportPreviewProps) {
  const metaPct = macroPercents({ kcal: profile.calorias, p: profile.prot, c: profile.carbo, l: profile.gord });
  const corte = Math.ceil(profile.meals.length / 2);
  const pagina1 = profile.meals.slice(0, corte);
  const pagina2 = profile.meals.slice(corte);

  const micros =
    profile.micros.modo === "manual"
      ? { lipideos: profile.micros.lipideos, minerais: profile.micros.minerais, vitaminas: profile.micros.vitaminas }
      : microGroups(totals.nutrientes);

  const macroCell = (label: string, value: string, unit: string, last = false) => (
    <div className={last ? "" : "border-r border-stone-200"}>
      <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">{label}</span>
      <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">{value}</span>
      {unit && <span className="text-[7pt] text-stone-500 ml-0.5">{unit}</span>}
    </div>
  );

  return (
    <main className="flex-1 bg-stone-200/60 overflow-y-auto p-4 md:p-8 flex flex-col items-center print-container">
      <div className="no-print w-full max-w-[210mm] mb-3 flex items-center justify-between text-xs text-stone-500">
        <span>Preview Editorial em Tempo Real (Fonte 9pt · 2 Páginas)</span>
        <span className="text-[11px] text-stone-400">Dimensão física: A4 (210 × 297 mm)</span>
      </div>

      {/* PÁGINA 1 */}
      <section className="a4-sheet flex flex-col justify-between">
        <div>
          <header className="flex justify-between items-baseline hairline-b pb-2">
            <div>
              <span className="text-[7pt] tracking-[0.2em] uppercase text-stone-400 font-medium block">
                Consultoria de Nutrição Clínica & Performance
              </span>
              <span className="text-[9.5pt] font-semibold tracking-tight text-stone-900">{profile.nutricionista}</span>
              <span className="text-[7.5pt] text-stone-400 ml-2">{profile.crn}</span>
            </div>
            <div className="text-right text-[7.5pt] text-stone-400">
              {profile.local} &nbsp;·&nbsp; {profile.telefone}
            </div>
          </header>

          <div className="mt-3.5 mb-2.5 flex items-baseline justify-between">
            <div>
              <h2 className="font-serif-title text-[16pt] font-normal tracking-tight text-stone-900 leading-tight">
                Planejamento Alimentar Individualizado
              </h2>
              <p className="text-[7.5pt] text-stone-400 font-light mt-0.5">
                Prescrição clínica para manutenção metabólica, composição corporal e rendimento físico.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[7pt] text-stone-400 uppercase tracking-wider block">Paciente</span>
              <span className="text-[10pt] font-medium text-stone-900">{profile.paciente}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 hairline-all bg-stone-50/70 text-center py-1.5 px-1 mb-3.5 text-[8pt]">
            {macroCell("Valor Energético", fmt(profile.calorias, 0), "kcal")}
            {macroCell("Proteínas", fmt(profile.prot), `g (${metaPct.p}%)`)}
            {macroCell("Carboidratos", fmt(profile.carbo), `g (${metaPct.c}%)`)}
            {macroCell("Lipídios", fmt(profile.gord), `g (${metaPct.l}%)`)}
            {macroCell("Fibras", fmt(profile.fibras), "g")}
            {macroCell("Meta Hídrica", profile.agua, "", true)}
          </div>

          {profile.suplementos.length > 0 && (
            <div className="mb-3.5">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className={sectionTitle}>01. Conduta Clínica & Suplementação</h2>
                <span className="text-[7pt] text-stone-400">{profile.data}</span>
              </div>
              <table className="w-full text-left hairline-all text-[7.8pt]">
                <thead className="bg-stone-50 text-[6.8pt] uppercase tracking-wider text-stone-400 hairline-b">
                  <tr>
                    <th className="py-1 px-2 w-[25%]">Composto</th>
                    <th className="py-1 px-2 w-[25%]">Posologia & Horário</th>
                    <th className="py-1 px-2 w-[50%]">Diretriz Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  {profile.suplementos.map((s) => (
                    <tr key={s.id}>
                      <td className="py-1 px-2 font-medium text-stone-900">{s.nome}</td>
                      <td className="py-1 px-2">{s.posologia}</td>
                      <td className="py-1 px-2 text-[7.2pt] text-stone-600">{s.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <h2 className={`${sectionTitle} mb-1.5`}>
              {profile.suplementos.length > 0 ? "02" : "01"}. Estrutura Alimentar
            </h2>
            {pagina1.map((m) => (
              <MealBlock key={m.id} meal={m} index={index} />
            ))}
          </div>
        </div>

        <footer className="pt-1.5 hairline-t flex justify-between items-center text-[7pt] text-stone-400 mt-2">
          <span>{profile.nutricionista} · {profile.crn} · Plano Alimentar Personalizado</span>
          <span>Página 1 de 2</span>
        </footer>
      </section>

      {/* PÁGINA 2 */}
      <section className="a4-sheet flex flex-col justify-between">
        <div>
          <header className="flex justify-between items-baseline hairline-b pb-1.5 mb-2.5 text-[7.5pt] text-stone-400">
            <span>{profile.nutricionista.toUpperCase()} — NUTRIÇÃO CLÍNICA & ESPORTIVA</span>
            <span>PLANO ALIMENTAR: {profile.paciente.toUpperCase()} · PÁGINA 2 DE 2</span>
          </header>

          {pagina2.map((m) => (
            <MealBlock key={m.id} meal={m} index={index} />
          ))}

          {profile.receita.nome && (
            <div className="hairline-all bg-stone-50/50 p-2 mb-3 text-[7.8pt] leading-[11pt]">
              <div className="flex justify-between items-baseline hairline-b pb-1 mb-1">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[7pt]">Receituário: {profile.receita.nome}</span>
                <span className="text-stone-400 text-[6.8pt]">{profile.receita.rendimento}</span>
              </div>
              <div className="grid grid-cols-12 gap-3 text-stone-700">
                <div className="col-span-5 border-r border-stone-200 pr-2"><b>Ingredientes:</b> {profile.receita.ingredientes}</div>
                <div className="col-span-7"><b>Modo de Preparo:</b> {profile.receita.preparo}</div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h2 className={sectionTitle}>Demonstrativo Nutricional & Micronutrientes</h2>
              <span className="text-[6.8pt] text-stone-400">Valores calculados a partir da TACO (4ª ed.)</span>
            </div>

            <table className="w-full text-left hairline-all text-[7.5pt] mb-1.5">
              <thead className="bg-stone-50 text-[6.8pt] uppercase tracking-wider text-stone-400 hairline-b">
                <tr>
                  <th className="py-1 px-2">Refeição Cadastrada</th>
                  <th className="py-1 px-2 text-center">Proteínas</th>
                  <th className="py-1 px-2 text-center">Lipídios</th>
                  <th className="py-1 px-2 text-center">Carboidratos</th>
                  <th className="py-1 px-2 text-right">Calorias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700 tabular-nums">
                {profile.meals.map((m) => {
                  const ts = m.opcoes.map((o) => optionTotals(o, index)).filter((t) => !t.vazia).map((t) => t.macros);
                  if (ts.length === 0) return null;
                  const j = (k: "p" | "l" | "c") => ts.map((t) => `${fmt(t[k])}g`).join(" / ");
                  return (
                    <tr key={m.id}>
                      <td className="py-1 px-2">{m.nome}{ts.length > 1 ? ` (${ts.map((_, i) => String.fromCharCode(65 + i)).join(" / ")})` : ""}</td>
                      <td className="py-1 px-2 text-center">{j("p")}</td>
                      <td className="py-1 px-2 text-center">{j("l")}</td>
                      <td className="py-1 px-2 text-center">{j("c")}</td>
                      <td className="py-1 px-2 text-right">{ts.map((t) => fmt(t.kcal, 0)).join(" / ")} kcal</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-stone-50 text-stone-900 hairline-t tabular-nums">
                <tr className="font-semibold">
                  <td className="py-1 px-2">MÉDIA DIÁRIA PLANEJADA (média das opções)</td>
                  <td className="py-1 px-2 text-center">{fmt(totals.media.p)} g</td>
                  <td className="py-1 px-2 text-center">{fmt(totals.media.l)} g</td>
                  <td className="py-1 px-2 text-center">{fmt(totals.media.c)} g</td>
                  <td className="py-1 px-2 text-right">{fmt(totals.media.kcal, 0)} kcal</td>
                </tr>
                <tr className="text-stone-500">
                  <td className="py-1 px-2">META PRESCRITA</td>
                  <td className="py-1 px-2 text-center">{fmt(profile.prot)} g</td>
                  <td className="py-1 px-2 text-center">{fmt(profile.gord)} g</td>
                  <td className="py-1 px-2 text-center">{fmt(profile.carbo)} g</td>
                  <td className="py-1 px-2 text-right">{fmt(profile.calorias, 0)} kcal</td>
                </tr>
              </tfoot>
            </table>

            {(micros.lipideos || micros.minerais || micros.vitaminas) && (
              <div className="hairline-all divide-y divide-stone-200 text-[7.2pt] leading-[9.5pt] p-2 bg-stone-50/40 text-stone-600">
                <MicroLine label="Ácidos Graxos & Fibras" text={micros.lipideos} className="pb-1" />
                <MicroLine label="Minerais" text={micros.minerais} className="py-1" />
                <MicroLine label="Vitaminas" text={micros.vitaminas} className="pt-1" />
              </div>
            )}
          </div>

          <div className="hairline-t pt-1.5 flex justify-between items-baseline text-[7.2pt] text-stone-500">
            <div>Documento técnico emitido em conformidade com as diretrizes do Conselho Federal de Nutricionistas (CFN).</div>
            <div className="text-right">
              <span className="font-medium text-stone-900">{profile.nutricionista}</span> &nbsp;·&nbsp; {profile.crn} &nbsp;·&nbsp; {profile.local}
            </div>
          </div>
        </div>

        <footer className="pt-1.5 hairline-t flex justify-between items-center text-[7pt] text-stone-400 mt-2">
          <span>{profile.nutricionista} · {profile.crn} · Plano Alimentar Personalizado</span>
          <span>Página 2 de 2</span>
        </footer>
      </section>
    </main>
  );
}
