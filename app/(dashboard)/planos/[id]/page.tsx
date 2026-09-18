"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import PlanBuilder from "@/components/PlanBuilder";
import { getPatientForPlanRoute } from "@/lib/store";
import type { Patient } from "@/lib/types";

export default function PlanBuilderPage() {
  const params = useParams<{ id: string }>();
  // undefined = ainda carregando; null = paciente não encontrado
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined);

  useEffect(() => {
    setPatient(getPatientForPlanRoute(String(params?.id ?? "")));
  }, [params?.id]);

  if (patient === undefined) return <div className="p-8 text-xs text-stone-600">Carregando…</div>;
  if (patient === null) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-3">
        <h2 className="font-serif-title text-xl">Paciente não encontrado</h2>
        <p className="text-xs text-stone-600">Não existe paciente ou plano com o identificador “{String(params?.id)}”.</p>
        <Link href="/pacientes" className="inline-block px-3 py-1.5 bg-stone-900 text-white text-xs rounded">Ver pacientes</Link>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col -m-6 overflow-hidden">
      <PlanBuilder patient={patient} />
    </div>
  );
}
