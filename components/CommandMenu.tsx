"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UtensilsCrossed,
  Calendar,
  Apple,
  Activity,
  ArrowRight,
  X,
} from "lucide-react";
import { getStoredPatients } from "@/lib/store";
import { Patient } from "@/lib/types";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPatients(getStoredPatients());
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) =>
    p.nome.toLowerCase().includes(query.toLowerCase()) ||
    p.objetivo.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    {
      title: "Iniciar Consulta com João Freire",
      subtitle: "Abrir modo clínico estruturado",
      icon: Calendar,
      href: "/consultas",
    },
    {
      title: "Construtor de Plano — João Freire",
      subtitle: "Editar dieta de 2.268 kcal e exportar A4",
      icon: UtensilsCrossed,
      href: "/pacientes",
    },
    {
      title: "Consultar Tabela TACO",
      subtitle: "Pesquisar 591 alimentos e medidas usuais",
      icon: Apple,
      href: "/alimentos",
    },
    {
      title: "Avaliações Antropométricas",
      subtitle: "Dobras de Jackson-Pollock e Bioimpedância",
      icon: Activity,
      href: "/avaliacoes",
    },
  ];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 gap-3">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome de um paciente, tela ou comando..."
            className="w-full text-xs text-stone-900 placeholder-stone-400 bg-transparent focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Patients Section */}
          <div>
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1">
              Pacientes ({filteredPatients.length})
            </div>
            <div className="space-y-0.5">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(`/pacientes/${p.id}`)}
                  className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center justify-center border border-stone-200">
                      {p.nome.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-stone-900 group-hover:text-black">
                        {p.nome}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {p.objetivo} · {p.dadosAntropometricos.peso} kg · Adesão: {p.adesaoMedia7d}%
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-xs text-stone-400 p-2 italic">
                  Nenhum paciente encontrado para &quot;{query}&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1">
              Ações Rápidas & Navegação
            </div>
            <div className="space-y-0.5">
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(qa.href)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-stone-100 text-stone-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-stone-900">
                          {qa.title}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {qa.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-stone-100 bg-stone-50 text-[10px] text-stone-400 flex items-center justify-between px-4">
          <span>Navegue com o mouse ou atalhos rápidos</span>
          <div className="flex items-center gap-2">
            <span>ESC para fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
