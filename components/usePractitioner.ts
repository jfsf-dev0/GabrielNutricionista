"use client";

import { useEffect, useState } from "react";
import { getStoredPractitioner, PRACTITIONER_GABRIEL } from "@/lib/store";
import type { PractitionerProfile } from "@/lib/types";

/** Perfil do profissional salvo neste navegador (o padrão até carregar). */
export function usePractitioner(): PractitionerProfile {
  const [p, setP] = useState<PractitionerProfile>(PRACTITIONER_GABRIEL);
  useEffect(() => setP(getStoredPractitioner()), []);
  return p;
}
