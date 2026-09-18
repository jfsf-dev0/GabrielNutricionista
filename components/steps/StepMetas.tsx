"use client";

import React, { useMemo } from "react";
import { MAX_GRAMAS_MACRO } from "@/lib/limits";
import { calcGoals } from "@/lib/nutrition";
import { fmt } from "@/lib/report";
import type { Antropometria, Objetivo, Sexo } from "@/lib/types";
import { Field, NumInput, SectionTitle, TextInput, inputCls } from "../ui";
import type { StepProps } from "./StepIdentificacao";

const ATIVIDADES = [
  [1.2, "Sedentário"], [1.375, "Leve (1–3x/sem)"], [1.55, "Moderado (3–5x/sem)"],
  [1.725, "Intenso (6–7x/sem)"], [1.9, "Muito intenso / 2x ao dia"],
] as const;

export default function StepMetas({ profile, onChange }: StepProps) {
  const set = <K extends keyof typeof profile>(k: K, v: (typeof profile)[K]) => onChange({ ...profile, [k]: v });
  const a = profile.antropometria;
  const setA = (patch: Partial<Antropometria>) => set("antropometria", { ...a, ...patch });
  const sugestao = useMemo(() => calcGoals(a), [a]);

  const aplicar = () => {
    if (!sugestao) return;
    onChange({
      ...profile,
      calorias: sugestao.kcal, prot: sugestao.p, carbo: sugestao.c, gord: sugestao.l, fibras: sugestao.fibras,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <SectionTitle>Calculadora de metas (ponto de partida)</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          <Field label="Peso (kg)"><NumInput value={a.peso ?? 0} step={0.1} max={500} onChange={(v) => setA({ peso: v || undefined })} /></Field>
          <Field label="Altura (cm)"><NumInput value={a.altura ?? 0} max={260} onChange={(v) => setA({ altura: v || undefined })} /></Field>
          <Field label="Idade"><NumInput value={a.idade ?? 0} max={120} onChange={(v) => setA({ idade: v || undefined })} /></Field>
          <Field label="Sexo">
            <select className={inputCls} value={a.sexo ?? ""} onChange={(e) => setA({ sexo: (e.target.value || undefined) as Sexo | undefined })}>
              <option value="">—</option><option value="M">Masculino</option><option value="F">Feminino</option>
            </select>
          </Field>
          <Field label="Atividade">
            <select className={inputCls} value={a.atividade ?? ""} onChange={(e) => setA({ atividade: Number(e.target.value) || undefined })}>
              <option value="">—</option>
              {ATIVIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Objetivo">
            <select className={inputCls} value={a.objetivo ?? "manutencao"} onChange={(e) => setA({ objetivo: e.target.value as Objetivo })}>
              <option value="perda">Perda (−20%)</option><option value="manutencao">Manutenção</option><option value="ganho">Ganho (+10%)</option>
            </select>
          </Field>
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-600">
          {sugestao ? (
            <>
              <span className="tabular-nums">
                Mifflin-St Jeor: <b>{fmt(sugestao.kcal, 0)} kcal</b> · P {sugestao.p} g · C {sugestao.c} g · L {sugestao.l} g · Fibras {sugestao.fibras} g
              </span>
              <button onClick={aplicar} className="ml-2 px-2 py-1 bg-stone-900 text-white rounded text-[11px] font-medium hover:bg-stone-800">
                Aplicar
              </button>
            </>
          ) : (
            <span className="text-stone-400">Preencha peso, altura, idade, sexo e atividade para sugerir metas.</span>
          )}
        </div>
        <p className="text-[10px] text-stone-400 mt-1">
          Proteína 1,8–2,0 g/kg · lipídios 1,0 g/kg · carboidrato fecha o restante. Sugestão inicial, o profissional ajusta.
        </p>
      </div>

      <div className="pt-3 border-t border-stone-200">
        <SectionTitle>Metas diárias</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          <Field label="Calorias (kcal)"><NumInput value={profile.calorias} onChange={(v) => set("calorias", v)} className="font-semibold" /></Field>
          <Field label="Proteínas (g)"><NumInput value={profile.prot} step={0.1} max={MAX_GRAMAS_MACRO} onChange={(v) => set("prot", v)} className="font-semibold" /></Field>
          <Field label="Carboidratos (g)"><NumInput value={profile.carbo} step={0.1} max={MAX_GRAMAS_MACRO} onChange={(v) => set("carbo", v)} className="font-semibold" /></Field>
          <Field label="Lipídios (g)"><NumInput value={profile.gord} step={0.1} max={MAX_GRAMAS_MACRO} onChange={(v) => set("gord", v)} className="font-semibold" /></Field>
          <Field label="Fibras (g)"><NumInput value={profile.fibras} step={0.1} max={MAX_GRAMAS_MACRO} onChange={(v) => set("fibras", v)} className="font-semibold" /></Field>
          <Field label="Meta hídrica"><TextInput value={profile.agua} onChange={(e) => set("agua", e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}
