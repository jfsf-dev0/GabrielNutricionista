"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Wallet,
  Play,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Utensils,
  Plus,
  FileText,
  Activity,
} from "lucide-react";
import {
  getStoredPatients,
  getStoredConsultations,
  getStoredDiary,
} from "@/lib/store";
import { usePortalHref } from "@/components/usePortalHref";
import { Patient, Consultation, DiaryEntry } from "@/lib/types";

export default function DashboardHomePage() {
  const portalHref = usePortalHref();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [recentDiary, setRecentDiary] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setPatients(getStoredPatients());
    setConsultations(getStoredConsultations());
    setRecentDiary(getStoredDiary());
  }, []);
  const alertPatients = patients.filter((p) => p.status === "alerta");
  const todayConsultations = consultations.filter((c) => c.horario);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider font-mono">
            Quinta-feira, 18 de Setembro de 2026 · Gabriel Alves (CRN-3: 81965/P)
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-0.5">
            Bom dia, Gabriel. Você tem 3 consultas agendadas para hoje.
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Plataforma clínica sincronizada com dados antropométricos, metas metabólicas e diário PWA dos pacientes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/consultas"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Consulta de João Freire</span>
          </Link>
          <Link
            href="/pacientes"
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Ver Dossiê A4 (9pt)</span>
          </Link>
        </div>
      </div>

      {/* 4 Top KPI Cards (Discovery W1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Consultas Hoje */}
        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Consultas Hoje</span>
            <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">3</span>
            <span className="text-xs text-emerald-600 font-medium">1 realizada</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            Próxima: Carlos Mendes às 15:30
          </div>
        </div>

        {/* KPI 2: Pacientes Ativos */}
        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Pacientes Ativos</span>
            <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">48</span>
            <span className="text-xs text-emerald-600 font-medium">+5 este mês</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            {alertPatients.length} paciente em alerta de atenção
          </div>
        </div>

        {/* KPI 3: Aderência Média 7d */}
        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Aderência Média (7d)</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">86.4%</span>
            <span className="text-xs text-emerald-600 font-medium">Excelente</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            +3.2% comparado à semana anterior
          </div>
        </div>

        {/* KPI 4: Faturamento do Mês */}
        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Faturamento (Setembro)</span>
            <div className="p-1.5 rounded-md bg-stone-100 text-stone-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">R$ 14.850</span>
            <span className="text-xs text-stone-500">82% recebido</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-400">
            R$ 2.450 a vencer nos próximos 12 dias
          </div>
        </div>
      </div>

      {/* Main Grid: Agenda (Left) + Clinical Alerts & Diary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda de Hoje (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Agenda do Dia · 18 de Setembro
                </h3>
                <p className="text-xs text-stone-500">
                  Atendimentos presenciais e teleconsultas programadas
                </p>
              </div>
              <Link
                href="/consultas"
                className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Ver calendário completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {todayConsultations.map((c) => {
                const patient = patients.find((p) => p.id === c.pacienteId);
                const isConcluida = c.status === "realizada";

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isConcluida
                        ? "bg-stone-50/70 border-stone-200 text-stone-500"
                        : "bg-white border-stone-200 hover:border-stone-400 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 shrink-0 font-mono">
                        <span className="text-xs font-bold text-stone-800">{c.horario}</span>
                        <span className="text-[9px] text-stone-400">{c.duracaoMinutos}m</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/pacientes/${c.pacienteId}`}
                            className="text-xs font-bold text-stone-900 hover:underline"
                          >
                            {c.pacienteNome}
                          </Link>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              c.tipo === "presencial"
                                ? "bg-stone-100 text-stone-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {c.tipo === "presencial" ? "Presencial" : "Teleconsulta"}
                          </span>
                          {isConcluida && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Realizada</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 mt-1 max-w-md">
                          {c.queixaPrincipal || "Consulta clínica de rotina e acompanhamento dietético."}
                        </p>

                        {patient && (
                          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-stone-400">
                            <span>Objetivo: <strong className="text-stone-600">{patient.objetivo}</strong></span>
                            <span>·</span>
                            <span>Peso atual: <strong className="text-stone-600">{patient.dadosAntropometricos.peso} kg</strong></span>
                            <span>·</span>
                            <span>Adesão 7d: <strong className="text-stone-600">{patient.adesaoMedia7d}%</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isConcluida ? (
                        <Link
                          href={`/planos/${c.pacienteId}`}
                          className="px-2.5 py-1.5 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs rounded-md font-medium transition-colors"
                        >
                          Ver Plano
                        </Link>
                      ) : (
                        <Link
                          href={`/consulta/${c.pacienteId}`}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Iniciar Atendimento</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-stone-600">
              Fluxos de Trabalho Rápidos:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/pacientes"
                className="px-2.5 py-1 text-xs bg-white border border-stone-200 hover:border-stone-400 rounded-md text-stone-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-stone-400" />
                <span>Cadastrar Paciente</span>
              </Link>
              <Link
                href="/alimentos"
                className="px-2.5 py-1 text-xs bg-white border border-stone-200 hover:border-stone-400 rounded-md text-stone-700 transition-colors flex items-center gap-1"
              >
                <Utensils className="w-3 h-3 text-stone-400" />
                <span>Buscar Alimento TACO</span>
              </Link>
              <Link
                href="/avaliacoes"
                className="px-2.5 py-1 text-xs bg-white border border-stone-200 hover:border-stone-400 rounded-md text-stone-700 transition-colors flex items-center gap-1"
              >
                <Activity className="w-3 h-3 text-stone-400" />
                <span>Calculadora TMB / Dobras</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Alerts & Patient Diary Feed */}
        <div className="space-y-4">
          {/* Alerts Card (M9) */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Atenção Clínica & Risco
                </h3>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                {alertPatients.length} ativo
              </span>
            </div>

            <div className="space-y-3">
              {alertPatients.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="font-bold text-stone-900 hover:underline"
                    >
                      {p.nome}
                    </Link>
                    <span className="text-[10px] text-amber-700 font-mono">
                      Adesão {p.adesaoMedia7d}%
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    {p.statusMotivo || "5 dias sem registro no diário alimentar."}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={`/pacientes/${p.id}?tab=diario`}
                      className="text-[11px] font-medium text-amber-800 hover:underline flex items-center gap-0.5"
                    >
                      <span>Ver histórico do diário</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs">
                <div className="flex items-center justify-between font-medium text-stone-800">
                  <span>Renovação de Ciclo Dietético</span>
                  <span className="text-[10px] text-stone-500 font-mono">Em 4 dias</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  João Freire completa 30 dias com o plano atual de 2.268 kcal. Reavaliação prevista.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Patient Diary Activity (M8) */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Diário & Check-ins (PWA)
                </h3>
                <p className="text-[10px] text-stone-400">
                  Últimos registros enviados pelos pacientes
                </p>
              </div>
              <Link
                href={portalHref}
                target="_blank"
                className="text-[11px] text-amber-700 hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>Visão Paciente</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentDiary.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-stone-100 bg-stone-50/50 text-xs flex items-start gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800 truncate">
                        João Freire · {item.refeicaoNome}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Opção {item.opcaoEscolhida}
                      </span>
                    </div>
                    {item.notas && (
                      <p className="text-[11px] text-stone-500 mt-0.5 italic">
                        &quot;{item.notas}&quot;
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400">
                      <span>Água acumulada: <strong>{item.aguaConsumidaMl}ml</strong></span>
                      <span>·</span>
                      <span>Nota: <strong>{item.avaliacaoEstrelas}/5 ★</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
