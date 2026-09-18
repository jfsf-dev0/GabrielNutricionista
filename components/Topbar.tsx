"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Play,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onOpenCommand?: () => void;
}

export default function Topbar({ title = "Painel Clínico", subtitle, onOpenCommand }: TopbarProps) {
  const [showAlerts, setShowAlerts] = useState(false);

  const alerts = [
    {
      id: "alt-1",
      tipo: "warning",
      titulo: "Ana Clara Lima: 5 dias sem diário",
      descricao: "Aderência caiu para 64%. Recomendado enviar lembrete ou reagendar.",
      link: "/pacientes/pac-ana-lima",
    },
    {
      id: "alt-2",
      tipo: "info",
      titulo: "Consulta hoje às 15:30: Carlos Mendes",
      descricao: "Retorno presencial para bioimpedância e exames.",
      link: "/consulta/pac-carlos-mendes",
    },
  ];

  return (
    <header className="no-print h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-stone-900 leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-stone-500 mt-0.5 leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center / Search Shortcut */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 text-stone-600 rounded-lg text-xs border border-stone-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span>Busca global e ações rápidas...</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-white border border-stone-200 rounded text-stone-500 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Alerts Bell Popover */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors relative cursor-pointer"
            title="Alertas clínicos e pendências"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                <span className="font-semibold text-stone-800">Alertas Clínicos Ativos</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                  {alerts.length} pendentes
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <Link
                    key={a.id}
                    href={a.link}
                    onClick={() => setShowAlerts(false)}
                    className="block p-2 rounded-lg hover:bg-stone-50 border border-stone-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-stone-900">{a.titulo}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{a.descricao}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-stone-200 mx-1" />

        {/* Quick action: Iniciar Consulta */}
        <Link
          href="/consulta/pac-joao-freire"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Iniciar Consulta</span>
        </Link>

        {/* Quick action: Novo Plano */}
        <Link
          href="/planos/pac-joao-freire"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-stone-500" />
          <span>Novo Plano</span>
        </Link>
      </div>
    </header>
  );
}
