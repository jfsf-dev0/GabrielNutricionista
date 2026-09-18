"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CalendarDays,
  Apple,
  Activity,
  Wallet,
  Settings,
  Smartphone,
  ChevronRight,
  Sparkles,
  Command,
} from "lucide-react";
import { PRACTITIONER_GABRIEL } from "@/lib/store";
import { usePortalHref } from "@/components/usePortalHref";

interface SidebarProps {
  onOpenCommand?: () => void;
}

export default function Sidebar({ onOpenCommand }: SidebarProps) {
  const pathname = usePathname();
  const portalHref = usePortalHref();

  const navigation = [
    { name: "Início", href: "/", icon: LayoutDashboard, exact: true },
    { name: "Pacientes", href: "/pacientes", icon: Users, badge: "4" },
    { name: "Planos Alimentares", href: "/planos", icon: UtensilsCrossed },
    { name: "Consultas & Agenda", href: "/consultas", icon: CalendarDays, badge: "Hoje: 3" },
    { name: "Tabela TACO", href: "/alimentos", icon: Apple },
    { name: "Avaliações Físicas", href: "/avaliacoes", icon: Activity },
    { name: "Financeiro", href: "/financeiro", icon: Wallet },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="no-print w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-950 font-bold font-serif flex items-center justify-center text-sm shadow-sm">
            GA
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-wide uppercase">
              Gabriel Alves
            </div>
            <div className="text-[10px] text-ondark-muted font-mono">
              Nutrição & Performance
            </div>
          </div>
        </div>
      </div>

      {/* Quick Command Trigger */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onOpenCommand}
          className="w-full bg-stone-800/80 hover:bg-stone-800 text-ondark-muted hover:text-stone-200 px-3 py-2 rounded-lg text-xs flex items-center justify-between border border-stone-700/60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-ondark-muted" />
            <span>Buscar paciente ou tela...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-stone-700 text-stone-300 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ondark-muted px-2 pb-1">
          Menu Principal
        </div>
        {navigation.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                active
                  ? "bg-stone-800 text-white shadow-sm border border-stone-700/50"
                  : "text-ondark-muted hover:text-stone-100 hover:bg-stone-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-stone-100" : "text-ondark-muted group-hover:text-stone-300"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    active
                      ? "bg-stone-700 text-stone-200"
                      : "bg-stone-800 text-ondark-muted group-hover:bg-stone-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 text-[10px] font-semibold uppercase tracking-wider text-ondark-muted px-2 pb-1">
          Acesso Paciente
        </div>
        <Link
          href={portalHref}
          target="_blank"
          className="group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20 border border-amber-500/20 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <div>
              <div>App do Paciente (PWA)</div>
              <div className="text-[9px] text-amber-500/70 font-mono">Ver visão João Freire</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </nav>

      {/* Footer Practitioner Card */}
      <div className="p-3 border-t border-stone-800 bg-stone-900/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-stone-800/40 border border-stone-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-stone-700 text-white text-xs font-bold flex items-center justify-center border border-stone-600">
              GA
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {PRACTITIONER_GABRIEL.nome}
            </div>
            <div className="text-[10px] text-ondark-muted font-mono truncate">
              {PRACTITIONER_GABRIEL.crn}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
