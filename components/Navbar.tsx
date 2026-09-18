"use client";

import React, { useRef, useState } from "react";
import { Download, FolderOpen, Plus, Printer, Trash2, Upload, UserCheck } from "lucide-react";
import type { PatientProfile } from "@/lib/types";

interface NavbarProps {
  profile: PatientProfile;
  saved: PatientProfile[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onLoadModel: () => void;
  onImport: (raw: unknown) => void;
  onPrint: () => void;
}

export default function Navbar({ profile, saved, onOpen, onDelete, onNew, onLoadModel, onImport, onPrint }: NavbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `plano_${(profile.paciente || "paciente").toLowerCase().replace(/\s+/g, "_")}.json`;
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
        onImport(JSON.parse(String(ev.target?.result)));
      } catch {
        alert("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  const btn = "px-2.5 py-1.5 border border-stone-200 hover:border-stone-400 text-stone-700 text-xs rounded transition-colors flex items-center gap-1.5";

  return (
    <header className="no-print h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded bg-stone-900 text-white flex items-center justify-center text-xs font-bold font-serif-title shrink-0">GA</div>
        <div className="min-w-0">
          <h1 className="text-xs font-bold uppercase tracking-wider text-stone-900 truncate">Gabriel Alves · Nutrição Clínica & Performance</h1>
          <div className="text-[10px] text-stone-400 truncate">Painel de Prescrição e Dossiê Editorial A4 · CRN-3: 81965/P</div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={onNew} className={btn} title="Começar uma ficha nova"><Plus className="w-3.5 h-3.5" /> Novo</button>
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className={btn}><FolderOpen className="w-3.5 h-3.5" /> Pacientes ({saved.length})</button>
          {menu && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-stone-200 rounded shadow-lg z-30 max-h-72 overflow-y-auto">
              {saved.length === 0 && <div className="p-3 text-xs text-stone-400">Nenhum paciente salvo. Use “Salvar paciente” na Revisão.</div>}
              {saved.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 hover:bg-stone-50 text-xs">
                  <button className="text-left flex-1 min-w-0" onClick={() => { onOpen(s.id); setMenu(false); }}>
                    <span className="block font-medium truncate">{s.paciente || "(sem nome)"}</span>
                    <span className="block text-[10px] text-stone-400">{new Date(s.atualizadoEm).toLocaleString("pt-BR")}</span>
                  </button>
                  <button onClick={() => confirm(`Excluir ${s.paciente || "este paciente"}?`) && onDelete(s.id)} className="p-1 text-stone-400 hover:text-red-600" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onLoadModel} className={btn} title="Carregar ficha modelo"><UserCheck className="w-3.5 h-3.5" /> Modelo</button>
        <button onClick={exportJson} className={btn} title="Baixar este paciente em JSON"><Download className="w-3 h-3 text-stone-500" /> JSON</button>
        <button onClick={() => fileRef.current?.click()} className={btn} title="Carregar paciente de JSON (aceita o formato antigo)">
          <Upload className="w-3 h-3 text-stone-500" /> Abrir
          <input ref={fileRef} type="file" accept=".json" onChange={importJson} className="hidden" />
        </button>
        <button onClick={onPrint} className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded flex items-center gap-1.5 shadow-sm">
          <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
        </button>
      </div>
    </header>
  );
}
