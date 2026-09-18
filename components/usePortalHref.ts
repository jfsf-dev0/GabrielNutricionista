"use client";

import { useEffect, useState } from "react";
import { getStoredPatients } from "@/lib/store";

/**
 * Link do portal com o token secreto do paciente (o id nunca vira token).
 * Sem `patientId`, usa o primeiro paciente. Enquanto carrega, "#".
 */
export function usePortalHref(patientId?: string): string {
  const [href, setHref] = useState("#");
  useEffect(() => {
    const patients = getStoredPatients();
    const p = patientId ? patients.find((x) => x.id === patientId) : patients[0];
    setHref(p?.portalToken ? `/portal/${p.portalToken}` : "#");
  }, [patientId]);
  return href;
}
