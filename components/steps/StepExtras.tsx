"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { microGroups, NOTA_SOMA_PARCIAL } from "@/lib/report";
import { uid } from "@/lib/profile";
import type { NutrientKey, Nutrients } from "@/lib/types";
import { Field, SectionTitle, TextInput, inputCls } from "../ui";
import type { StepProps } from "./StepIdentificacao";

export default function StepExtras({ profile, onChange, nutrientes, semDado }: StepProps & { nutrientes: Nutrients; semDado: Partial<Record<NutrientKey, number>> }) {
  const set = <K extends keyof typeof profile>(k: K, v: (typeof profile)[K]) => onChange({ ...profile, [k]: v });
  const patchSup = (i: number, patch: Partial<(typeof profile.suplementos)[number]>) =>
    set("suplementos", profile.suplementos.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const auto = microGroups(nutrientes, semDado);

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Conduta clínica e suplementação</SectionTitle>
          <button
            onClick={() => set("suplementos", [...profile.suplementos, { id: uid(), nome: "Novo composto", posologia: "1 dose/dia", obs: "" }])}
            className="text-xs text-stone-900 font-medium hover:underline flex items-center gap-1"
          ><Plus className="w-3.5 h-3.5" /> Adicionar</button>
        </div>
        <div className="space-y-2.5">
          {profile.suplementos.map((s, i) => (
            <div key={s.id} className="p-3 rounded border border-stone-200 bg-stone-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <input value={s.nome} onChange={(e) => patchSup(i, { nome: e.target.value })} placeholder="Nome do composto" className="font-medium text-xs w-[70%] bg-transparent outline-none" />
                <button onClick={() => set("suplementos", profile.suplementos.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-600" title="Remover"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <TextInput value={s.posologia} onChange={(e) => patchSup(i, { posologia: e.target.value })} placeholder="Posologia e horário" />
              <textarea rows={2} value={s.obs} onChange={(e) => patchSup(i, { obs: e.target.value })} placeholder="Diretriz técnica / observação" className={inputCls} />
            </div>
          ))}
          {profile.suplementos.length === 0 && <p className="text-[11px] text-stone-400">Nenhum item. A seção fica vazia no relatório.</p>}
        </div>
      </section>

      <section className="pt-3 border-t border-stone-200 space-y-2.5">
        <SectionTitle>Receituário técnico</SectionTitle>
        <Field label="Nome da receita"><TextInput value={profile.receita.nome} onChange={(e) => set("receita", { ...profile.receita, nome: e.target.value })} /></Field>
        <Field label="Rendimento e tempo"><TextInput value={profile.receita.rendimento} onChange={(e) => set("receita", { ...profile.receita, rendimento: e.target.value })} /></Field>
        <Field label="Ingredientes"><textarea rows={3} value={profile.receita.ingredientes} onChange={(e) => set("receita", { ...profile.receita, ingredientes: e.target.value })} className={inputCls} /></Field>
        <Field label="Modo de preparo"><textarea rows={3} value={profile.receita.preparo} onChange={(e) => set("receita", { ...profile.receita, preparo: e.target.value })} className={inputCls} /></Field>
      </section>

      <section className="pt-3 border-t border-stone-200 space-y-2.5">
        <SectionTitle>Micronutrientes no relatório</SectionTitle>
        <div className="flex gap-4 text-xs text-stone-700">
          {(["auto", "manual"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={profile.micros.modo === m} onChange={() => set("micros", { ...profile.micros, modo: m })} />
              {m === "auto" ? "Somar dos alimentos" : "Texto manual"}
            </label>
          ))}
        </div>
        {profile.micros.modo === "auto" ? (
          <div className="rounded border border-stone-200 bg-stone-50 p-2.5 text-[11px] text-stone-600 space-y-1">
            <div><b>Fibras e colesterol:</b> {auto.lipideos || "—"}</div>
            <div><b>Minerais:</b> {auto.minerais || "—"}</div>
            <div><b>Vitaminas:</b> {auto.vitaminas || "—"}</div>
            {auto.parcial && <p className="text-[10px] text-amber-800 pt-1">{NOTA_SOMA_PARCIAL}</p>}
            <p className="text-[10px] text-stone-400 pt-1">
              Somados dos alimentos vinculados (média das opções). A TACO não traz B12, folato, vitamina D/E, selênio nem perfil de ácidos graxos;
              itens sem vínculo não entram. Use “Texto manual” se precisar desses dados.
            </p>
          </div>
        ) : (
          <>
            <Field label="Ácidos graxos e fibras"><TextInput value={profile.micros.lipideos} onChange={(e) => set("micros", { ...profile.micros, lipideos: e.target.value })} /></Field>
            <Field label="Minerais e eletrólitos"><TextInput value={profile.micros.minerais} onChange={(e) => set("micros", { ...profile.micros, minerais: e.target.value })} /></Field>
            <Field label="Vitaminas"><TextInput value={profile.micros.vitaminas} onChange={(e) => set("micros", { ...profile.micros, vitaminas: e.target.value })} /></Field>
          </>
        )}
      </section>
    </div>
  );
}
