"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { useFoods } from "@/components/FoodsProvider";
import ReportPreview from "@/components/ReportPreview";
import { dayTotals } from "@/lib/nutrition";
import { getPatientByPortalToken, getStoredPlanProfile } from "@/lib/store";
import type { PatientProfile } from "@/lib/types";

/** Plano do paciente em A4 (2 páginas), acessível só pelo token do portal. */
export default function RelatorioPacientePage() {
  const params = useParams<{ token: string }>();
  const { index } = useFoods();
  const [profile, setProfile] = useState<PatientProfile | null | undefined>(undefined);
  const printed = useRef(false);

  useEffect(() => {
    const p = getPatientByPortalToken(String(params?.token ?? ""));
    setProfile(p ? getStoredPlanProfile(p.id) : null);
  }, [params?.token]);

  useEffect(() => {
    if (!profile || printed.current) return;
    if (new URLSearchParams(window.location.search).get("print") === "true") {
      printed.current = true;
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [profile]);

  const totals = useMemo(() => (profile ? dayTotals(profile, index) : null), [profile, index]);

  if (profile === undefined) return <div className="p-8 text-xs text-stone-600">Carregando…</div>;
  if (profile === null || !totals) {
    return (
      <main className="p-8 text-center space-y-2" role="alert">
        <h1 className="font-serif-title text-lg text-stone-900">Link inválido ou expirado</h1>
        <p className="text-xs text-stone-600">Peça um novo link de acesso ao seu nutricionista.</p>
      </main>
    );
  }
  return (
    <main>
      <h1 className="sr-only">Plano alimentar de {profile.paciente}</h1>
      <div className="no-print flex justify-end p-3">
        <button onClick={() => window.print()} className="px-3 py-1.5 bg-stone-900 text-white text-xs rounded flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5" aria-hidden="true" /> Imprimir / salvar PDF
        </button>
      </div>
      <ReportPreview profile={profile} index={index} totals={totals} />
    </main>
  );
}
