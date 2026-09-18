"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Search,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { getStoredPatients, getStoredPlanProfile } from "@/lib/store";
import { Patient } from "@/lib/types";

export default function PlansDirectoryPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPatients(getStoredPatients());
  }, []);

  const templates = [
    {
      titulo: "Protocolo Hipertrofia Limpa (2.400 kcal)",
      desc: "Distribuição 2.2g/kg P, 45% C, 25% L. 5 refeições estruturadas com opções A/B.",
      categoria: "Hipertrofia",
      calorias: 2400,
      prot: 180,
    },
    {
      titulo: "Protocolo Déficit Calórico Controlado (1.800 kcal)",
      desc: "Alta saciedade, 2.0g/kg P, rica em fibras (35g+). Ideal para definição muscular.",
      categoria: "Emagrecimento",
      calorias: 1800,
      prot: 155,
    },
    {
      titulo: "Protocolo Atleta Alto Rendimento (2.800 kcal)",
      desc: "Periodização de carboidratos intra e pós-treino para esportes de alta intensidade.",
      categoria: "Performance",
      calorias: 2800,
      prot: 190,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Planos Alimentares & Prescrições
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Biblioteca de dietas ativas por paciente e modelos de protocolos clínicos.
          </p>
        </div>

        <Link
          href="/pacientes"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Abrir Construtor de Planos</span>
        </Link>
      </div>

      {/* Active Patient Plans */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Planos em Vigor por Paciente
            </h3>
            <p className="text-xs text-stone-500">
              Prescrições ativas com cálculo de macros e dossiê A4 gerado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p) => {
            const isJoao = p.id === "pac-joao-freire";
            const kcal = isJoao ? 2268 : p.dadosAntropometricos.tmb + 400;
            const prot = isJoao ? 171.6 : Math.round(p.dadosAntropometricos.peso * 2.0);

            return (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-stone-100 rounded text-stone-700">
                      {p.objetivo}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Última atualização: {p.ultimaConsulta}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 mt-2">
                    {p.nome}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isJoao
                      ? "Hipertrofia & Recomposição Corporal · Fase 1"
                      : `Acompanhamento individual para ${p.objetivo.toLowerCase()}`}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-stone-50 rounded-lg text-center text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-stone-400">Calorias</div>
                      <div className="font-bold text-stone-800">{kcal} kcal</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Proteína</div>
                      <div className="font-bold text-stone-800">{prot}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Adesão</div>
                      <div className="font-bold text-emerald-600">{p.adesaoMedia7d}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/planos/${p.id}`}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium text-center transition-colors shadow-2xs"
                  >
                    Editar no Construtor W3
                  </Link>
                  <Link
                    href={`/planos/${p.id}?print=true`}
                    className="p-1.5 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg transition-colors"
                    title="Exportar Dossiê A4 (9pt)"
                  >
                    <Printer className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protocol Templates Library */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Modelos de Protocolos Nutricionais (Templates)
          </h3>
          <p className="text-xs text-stone-500">
            Estruturas pré-calculadas prontas para duplicar e aplicar a novos pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 text-stone-700 rounded font-medium">
                  {tpl.categoria}
                </span>
                <h4 className="text-xs font-bold text-stone-900 mt-2">
                  {tpl.titulo}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  {tpl.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="font-mono text-stone-600 font-semibold">
                  {tpl.calorias} kcal · {tpl.prot}g P
                </span>
                <Link
                  href="/pacientes"
                  className="text-stone-900 hover:underline font-medium text-[11px]"
                >
                  Usar Modelo
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
