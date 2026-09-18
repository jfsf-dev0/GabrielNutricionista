"use client";

import React, { useRef } from "react";
import { Printer, Download, Upload, RotateCcw, UserCheck } from "lucide-react";
import { PatientProfile } from "@/lib/types";
import { defaultProfile } from "@/lib/defaultProfile";

interface NavbarProps {
  profile: PatientProfile;
  onUpdateProfile: (profile: PatientProfile) => void;
  onReset: () => void;
}

export default function Navbar({ profile, onUpdateProfile, onReset }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement("a");
    const nameSlug = (profile.paciente || "paciente").toLowerCase().replace(/\s+/g, "_");
    a.href = dataStr;
    a.download = `plano_${nameSlug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onUpdateProfile(parsed);
      } catch (err) {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="no-print h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center text-xs font-bold font-serif-title">
          GA
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Gabriel Alves · Nutrição Clínica & Performance
          </h1>
          <div className="text-[10px] text-stone-400">
            Painel de Prescrição e Dossiê Editorial A4 · CRN-3: 81965/P
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateProfile(defaultProfile)}
          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          title="Carregar ficha padrão João Freire"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Perfil Modelo (João Freire)</span>
        </button>

        <button
          onClick={onReset}
          className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-medium rounded transition-colors flex items-center gap-1"
          title="Limpar campos para nova prescrição"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExportJSON}
          className="px-2.5 py-1.5 border border-stone-200 hover:border-stone-400 text-stone-700 text-xs rounded transition-colors flex items-center gap-1.5"
          title="Salvar paciente em JSON"
        >
          <Download className="w-3 h-3 text-stone-500" />
          <span>Salvar JSON</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 border border-stone-200 hover:border-stone-400 text-stone-700 text-xs rounded transition-colors flex items-center gap-1.5"
          title="Carregar paciente de JSON"
        >
          <Upload className="w-3 h-3 text-stone-500" />
          <span>Carregar JSON</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </button>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-sm ml-1"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar PDF (2 Páginas)</span>
        </button>
      </div>
    </header>
  );
}
