"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Eraser, Printer, Upload } from "lucide-react";
import { browserFavoritos, type Favoritos } from "@/lib/favoritos";
import { restrictionsFromStrings } from "@/lib/foods";
import { migrateProfile } from "@/lib/migrate";
import { dayTotals } from "@/lib/nutrition";
import { freshPlanFor, getStoredPlanProfile, saveStoredPlanProfile } from "@/lib/store";
import type { Patient, PatientProfile } from "@/lib/types";
import { validatePlan } from "@/lib/validate";
import Editor from "./Editor";
import { useFoods } from "./FoodsProvider";
import ReportPreview from "./ReportPreview";

type SaveState = { estado: "carregando" } | { estado: "salvo"; em: Date } | { estado: "erro" };

/** Une as restrições do cadastro do paciente às já marcadas no plano (nunca remove as do plano). */
function withPatientRestrictions(profile: PatientProfile, patient: Patient): PatientProfile {
  const doCadastro = restrictionsFromStrings(patient.restricoes);
  return { ...profile, restricoes: { ...profile.restricoes, tags: [...new Set([...profile.restricoes.tags, ...doCadastro.tags])] } };
}

/** Construtor de plano de UM paciente: carrega, valida e salva automaticamente no armazenamento do paciente. */
export default function PlanBuilder({ patient }: { patient: Patient }) {
  const { index } = useFoods();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [save, setSave] = useState<SaveState>({ estado: "carregando" });
  const [favoritos, setFavoritos] = useState<Map<number, number>>(new Map());
  const fav = useRef<Favoritos | null>(null);
  const dirty = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fav.current = browserFavoritos();
    setFavoritos(fav.current.all());
    setProfile(withPatientRestrictions(getStoredPlanProfile(patient.id), patient));
    dirty.current = false;
  }, [patient]);

  const persist = useCallback(
    (p: PatientProfile) => {
      const ok = saveStoredPlanProfile(patient.id, p);
      setSave(ok ? { estado: "salvo", em: new Date() } : { estado: "erro" });
    },
    [patient.id],
  );

  // Salvamento automático (só depois de uma edição do usuário).
  useEffect(() => {
    if (!profile || !dirty.current) return;
    const t = setTimeout(() => persist(profile), 400);
    return () => clearTimeout(t);
  }, [profile, persist]);

  const change = useCallback((p: PatientProfile) => {
    dirty.current = true;
    setProfile({ ...p, paciente: patient.nome });
  }, [patient.nome]);

  // ?print=true abre a impressão assim que o plano estiver carregado.
  const printed = useRef(false);
  useEffect(() => {
    if (!profile || printed.current || typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("print") === "true") {
      printed.current = true;
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [profile]);

  const totals = useMemo(() => (profile ? dayTotals(profile, index) : null), [profile, index]);
  const issues = useMemo(() => (profile ? validatePlan(profile, index) : []), [profile, index]);

  const onFoodUsed = useCallback((id: number) => {
    fav.current?.bump([id]);
    setFavoritos(fav.current?.all() ?? new Map());
  }, []);

  const exportJson = () => {
    if (!profile) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `plano_${patient.nome.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = migrateProfile(JSON.parse(String(ev.target?.result)));
        if (confirm(`Substituir o plano atual de ${patient.nome} pelo arquivo importado?`)) change(withPatientRestrictions({ ...imported, id: profile?.id ?? imported.id }, patient));
      } catch {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  const clearPlan = () => {
    if (confirm(`Limpar todas as refeições do plano de ${patient.nome}? Esta ação não pode ser desfeita.`)) change(withPatientRestrictions(freshPlanFor(patient), patient));
  };

  if (!profile || !totals) return <div className="p-8 text-xs text-stone-600">Carregando plano…</div>;

  const status =
    save.estado === "erro" ? (
      <span role="alert" className="text-red-700">Não foi possível salvar (armazenamento cheio ou bloqueado). Use “Exportar JSON”.</span>
    ) : save.estado === "salvo" ? (
      <span className="text-emerald-800">Salvo às {save.em.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
    ) : (
      <span className="text-stone-600">Alterações são salvas automaticamente</span>
    );

  const btn = "px-2.5 py-1.5 border border-stone-300 hover:border-stone-500 text-stone-800 text-xs rounded transition-colors flex items-center gap-1.5";

  return (
    <div className="h-full flex flex-col">
      <div className="no-print h-12 bg-white border-b border-stone-200 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/pacientes/${patient.id}`} className="flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {patient.nome}
          </Link>
          <span className="text-[11px]" aria-live="polite">{status}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearPlan} className={btn}><Eraser className="w-3.5 h-3.5" aria-hidden="true" /> Limpar plano</button>
          <button onClick={exportJson} className={btn}><Download className="w-3.5 h-3.5" aria-hidden="true" /> Exportar JSON</button>
          <button onClick={() => fileRef.current?.click()} className={btn}>
            <Upload className="w-3.5 h-3.5" aria-hidden="true" /> Importar JSON
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={importJson} className="hidden" aria-label="Importar plano em JSON" />
          <button onClick={() => window.print()} className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" aria-hidden="true" /> Imprimir / PDF
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <Editor
          profile={profile} onChange={change} index={index} totals={totals} issues={issues}
          favoritos={favoritos} onFoodUsed={onFoodUsed}
          saved={save.estado === "salvo" ? true : save.estado === "erro" ? false : null}
          onSave={() => persist(profile)} onPrint={() => window.print()} lockName
        />
        <ReportPreview profile={profile} index={index} totals={totals} />
      </div>
    </div>
  );
}
