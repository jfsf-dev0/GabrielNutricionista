"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import PatientEditor from "@/components/PatientEditor";
import ReportPreview from "@/components/ReportPreview";
import { defaultProfile } from "@/lib/defaultProfile";
import { PatientProfile } from "@/lib/types";

export default function HomePage() {
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);

  const handleReset = () => {
    if (confirm("Deseja redefinir os campos para uma nova prescrição?")) {
      setProfile({
        ...defaultProfile,
        paciente: "",
        data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        calorias: 2000,
        prot: 150,
        carbo: 200,
        gord: 60,
        fibras: 30,
        suplementos: [
          { id: "sup-1", nome: "Creatina Monohidratada", posologia: "3 g/dia", obs: "Uso contínuo." },
          { id: "sup-2", nome: "Hidratação", posologia: "35ml/kg", obs: "Fracionar ao longo do dia." }
        ]
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navbar
        profile={profile}
        onUpdateProfile={setProfile}
        onReset={handleReset}
      />
      <div className="flex-1 flex overflow-hidden">
        <PatientEditor profile={profile} onChange={setProfile} />
        <ReportPreview profile={profile} />
      </div>
    </div>
  );
}
