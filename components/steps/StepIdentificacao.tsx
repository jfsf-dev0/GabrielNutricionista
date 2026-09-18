"use client";

import React from "react";
import { RESTRICTION_LABELS } from "@/lib/foods";
import type { PatientProfile, RestrictionKey } from "@/lib/types";
import { Field, SectionTitle, TextInput } from "../ui";

export interface StepProps {
  profile: PatientProfile;
  onChange: (p: PatientProfile) => void;
}

export default function StepIdentificacao({ profile, onChange, lockName }: StepProps & { lockName?: boolean }) {
  const set = <K extends keyof PatientProfile>(k: K, v: PatientProfile[K]) => onChange({ ...profile, [k]: v });
  const tags = profile.restricoes.tags;
  const toggle = (t: RestrictionKey) =>
    set("restricoes", { ...profile.restricoes, tags: tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t] });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome do paciente">
          <TextInput value={profile.paciente} onChange={(e) => set("paciente", e.target.value)} readOnly={lockName} title={lockName ? "O nome vem do cadastro do paciente" : undefined} className={lockName ? "bg-stone-50" : ""} />
        </Field>
        <Field label="Data da prescrição">
          <TextInput value={profile.data} onChange={(e) => set("data", e.target.value)} />
        </Field>
        <Field label="Fase do protocolo">
          <TextInput value={profile.fase} onChange={(e) => set("fase", e.target.value)} />
        </Field>
        <Field label="Nutricionista responsável">
          <TextInput value={profile.nutricionista} onChange={(e) => set("nutricionista", e.target.value)} />
        </Field>
      </div>

      <div className="pt-3 border-t border-stone-200">
        <SectionTitle>Restrições e preferências</SectionTitle>
        <p className="text-[10.5px] text-stone-500 mb-2">
          A busca e as sugestões sinalizam alimentos que conflitam. A checagem usa grupo e nome do alimento:
          é um alerta, confirme sempre com a anamnese.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(RESTRICTION_LABELS) as RestrictionKey[]).map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={tags.includes(t)} onChange={() => toggle(t)} />
              {RESTRICTION_LABELS[t]}
            </label>
          ))}
        </div>
        <Field label="Outros alimentos a evitar (separe por vírgula)" className="mt-3">
          <TextInput
            value={profile.restricoes.termos}
            onChange={(e) => set("restricoes", { ...profile.restricoes, termos: e.target.value })}
            placeholder="ex.: abacaxi, coentro, fígado"
          />
        </Field>
      </div>
    </div>
  );
}
