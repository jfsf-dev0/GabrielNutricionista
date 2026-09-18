"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Activity,
  FileText,
  Calendar,
  Utensils,
  BookOpen,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Play,
  Printer,
  ChevronRight,
  TrendingUp,
  Droplets,
  Scale,
  Sparkles,
  Edit3,
} from "lucide-react";
import {
  getStoredPatients,
  getStoredPlanProfile,
  getStoredDiary,
  getStoredFinancial,
} from "@/lib/store";
import { usePortalHref } from "@/components/usePortalHref";
import { Patient, PatientProfile, DiaryEntry, FinancialItem } from "@/lib/types";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = String(params?.id ?? "");
  const portalHref = usePortalHref(patientId);
  const [notFound, setNotFound] = useState(false);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [financial, setFinancial] = useState<FinancialItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("resumo");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const all = getStoredPatients();
    const found = all.find((p) => p.id === patientId);
    if (!found) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setPatient(found);
    setProfile(getStoredPlanProfile(found.id));
    setDiary(getStoredDiary(found.id));
    setFinancial(getStoredFinancial().filter((f) => f.pacienteId === found.id));
  }, [patientId]);

  if (notFound) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-3">
        <h2 className="font-serif-title text-xl">Paciente não encontrado</h2>
        <Link href="/pacientes" className="inline-block px-3 py-1.5 bg-stone-900 text-white text-xs rounded">Ver pacientes</Link>
      </div>
    );
  }

  if (!patient || !profile) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        Carregando ficha do paciente...
      </div>
    );
  }

  const tabs = [
    { id: "resumo", label: "Resumo", icon: Activity },
    { id: "prontuario", label: "Prontuário & Anamnese", icon: BookOpen },
    { id: "avaliacoes", label: "Avaliações Físicas", icon: Scale },
    { id: "plano", label: "Plano Alimentar Ativo", icon: Utensils },
    { id: "diario", label: "Diário & Aderência PWA", icon: Droplets },
    { id: "exames", label: "Exames Laboratoriais", icon: FileText },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Patient Header (Discovery W2) */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-stone-900 text-white font-serif text-xl font-bold flex items-center justify-center shrink-0 shadow-xs">
              {patient.nome.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-stone-900 leading-tight">
                  {patient.nome}
                </h2>
                <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono font-medium">
                  {patient.objetivo}
                </span>
                {patient.status === "alerta" ? (
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Em Alerta</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Ativo</span>
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span>{patient.idade} anos ({patient.genero === "M" ? "Masculino" : "Feminino"})</span>
                <span>·</span>
                <span className="font-mono">{patient.email}</span>
                <span>·</span>
                <span className="font-mono">{patient.telefone}</span>
              </div>

              {/* Restrictions badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-medium">Restrições / Condições:</span>
                {patient.restricoes.map((r, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded border border-stone-200"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/consulta/${patient.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Consulta</span>
            </Link>

            <Link
              href={`/planos/${patient.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-stone-200 hover:bg-stone-50 text-stone-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Utensils className="w-3.5 h-3.5 text-stone-500" />
              <span>Editar Plano Alimentar</span>
            </Link>

            <button
              onClick={() => router.push(`/planos/${patient.id}?print=true`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium transition-colors"
              title="Visualizar e Imprimir Dossiê Editorial A4"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Dossiê A4 (9pt)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-t border-stone-100 mt-5 pt-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                  active
                    ? "bg-stone-900 text-white shadow-2xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: Resumo */}
      {activeTab === "resumo" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Antropometria & Metabolismo */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Métricas Antropométricas</span>
              <Scale className="w-4 h-4 text-stone-400" />
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-[10px] text-stone-400">Peso Atual</div>
                <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {patient.dadosAntropometricos.peso} kg
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-[10px] text-stone-400">Altura</div>
                <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {patient.dadosAntropometricos.altura} cm
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-[10px] text-stone-400">IMC Atual</div>
                <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {patient.dadosAntropometricos.imc}
                </div>
                <div className="text-[9px] text-stone-400">Eutrofia</div>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-[10px] text-stone-400">% Gordura (BF)</div>
                <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                  {patient.dadosAntropometricos.percentualGordura}%
                </div>
                <div className="text-[9px] text-stone-400">Massa: {patient.dadosAntropometricos.massaMagraKg}kg</div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-500">
                <span>Taxa Metabólica Basal (TMB):</span>
                <strong className="font-mono text-stone-800">{patient.dadosAntropometricos.tmb} kcal</strong>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Gasto Energético Total (GET):</span>
                <strong className="font-mono text-stone-800">{patient.dadosAntropometricos.get} kcal</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Plano Alimentar Vigente */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Plano Ativo (Prescrição)</span>
              <Utensils className="w-4 h-4 text-stone-400" />
            </h3>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-stone-600">Meta Calórica</span>
                <span className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                  {profile.calorias} kcal
                </span>
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Superávit controlado para ganho de massa magra
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-stone-600">Proteínas (2.2g/kg)</span>
                  <span className="font-mono font-bold text-stone-900">{profile.prot}g (30%)</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-stone-800 h-full rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-stone-600">Carboidratos</span>
                  <span className="font-mono font-bold text-stone-900">{profile.carbo}g (41%)</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-stone-800 h-full rounded-full" style={{ width: "41%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-stone-600">Lipídeos</span>
                  <span className="font-mono font-bold text-stone-900">{profile.gord}g (29%)</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-stone-800 h-full rounded-full" style={{ width: "29%" }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Refeições Fracionadas:</span>
              <strong className="text-stone-800">5 refeições estruturadas</strong>
            </div>
          </div>

          {/* Card 3: Aderência & Engajamento PWA */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Engajamento & Diário PWA</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="text-center py-2">
              <div className="text-3xl font-bold text-stone-900 font-mono tabular-nums">
                {patient.adesaoMedia7d}%
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">
                Aderência Excelente (Últimos 7 dias)
              </div>
              <div className="text-[11px] text-stone-400 mt-1">
                Sequência ativa: <strong>{patient.streakDias} dias consecutivos</strong>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Ingestão Hídrica Média:</span>
                <strong className="text-stone-800 font-mono">{profile.agua}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Check-ins Realizados:</span>
                <strong className="text-stone-800 font-mono">14 de 15 refeições</strong>
              </div>
            </div>

            <Link
              href={portalHref}
              target="_blank"
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Abrir App do Paciente (PWA)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Prontuário & Anamnese */}
      {activeTab === "prontuario" && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              Anamnese Clínica & Estilo de Vida
            </h3>
            <p className="text-xs text-stone-500">
              Informações qualitativas coletadas no atendimento inicial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50">
              <div className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">
                Padrão de Sono
              </div>
              <div className="font-semibold text-stone-800 mt-1">
                {patient.anamnese?.sono || "7h a 8h por noite"}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50">
              <div className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">
                Função Intestinal
              </div>
              <div className="font-semibold text-stone-800 mt-1">
                {patient.anamnese?.intestino || "Regular diário"}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50">
              <div className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">
                Atividade Física Atual
              </div>
              <div className="font-semibold text-stone-800 mt-1">
                {patient.anamnese?.atividadeFisica || "Musculação 5x/sem"}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50">
              <div className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">
                Consumo de Álcool & Tabaco
              </div>
              <div className="font-semibold text-stone-800 mt-1">
                {patient.anamnese?.alcoolFumo || "Esporádico social"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              Notas de Evolução & Conduta
            </h3>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
              {patient.notasClinicas}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Avaliações Físicas */}
      {activeTab === "avaliacoes" && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Histórico Antropométrico & Dobras Cutâneas
              </h3>
              <p className="text-xs text-stone-500">
                Protocolo Jackson & Pollock (7 Dobras) e Circunferências Corporais
              </p>
            </div>
            <Link
              href="/avaliacoes"
              className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
            >
              Registrar Nova Medição
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Dobras Cutâneas (mm)
              </h4>
              <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Ponto Anatômico</th>
                      <th className="p-2.5 text-right">Espessura (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="p-2.5">Peitoral</td><td className="p-2.5 text-right font-mono font-semibold">7.0 mm</td></tr>
                    <tr><td className="p-2.5">Abdominal</td><td className="p-2.5 text-right font-mono font-semibold">14.0 mm</td></tr>
                    <tr><td className="p-2.5">Coxa Anterior</td><td className="p-2.5 text-right font-mono font-semibold">11.0 mm</td></tr>
                    <tr><td className="p-2.5">Tríceps</td><td className="p-2.5 text-right font-mono font-semibold">8.0 mm</td></tr>
                    <tr><td className="p-2.5">Subescapular</td><td className="p-2.5 text-right font-mono font-semibold">11.0 mm</td></tr>
                    <tr><td className="p-2.5">Supra-ilíaca</td><td className="p-2.5 text-right font-mono font-semibold">9.5 mm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Circunferências (cm)
              </h4>
              <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Segmento</th>
                      <th className="p-2.5 text-right">Medida (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="p-2.5">Cintura</td><td className="p-2.5 text-right font-mono font-semibold">78.5 cm</td></tr>
                    <tr><td className="p-2.5">Abdome</td><td className="p-2.5 text-right font-mono font-semibold">81.0 cm</td></tr>
                    <tr><td className="p-2.5">Quadril</td><td className="p-2.5 text-right font-mono font-semibold">98.0 cm</td></tr>
                    <tr><td className="p-2.5">Braço Contraído</td><td className="p-2.5 text-right font-mono font-semibold">38.5 cm</td></tr>
                    <tr><td className="p-2.5">Coxa</td><td className="p-2.5 text-right font-mono font-semibold">58.0 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Plano Alimentar */}
      {activeTab === "plano" && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Prescrição Nutricional: {profile.fase}
              </h3>
              <p className="text-xs text-stone-500">
                Total: {profile.calorias} kcal · P: {profile.prot}g · C: {profile.carbo}g · G: {profile.gord}g
              </p>
            </div>
            <Link
              href={`/planos/${patient.id}`}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Abrir no Construtor W3</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.values(profile.meals).map((meal) => (
              <div
                key={meal.id}
                className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                      {meal.horario}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {meal.nome}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                  {meal.opcoes?.map((opt, oIdx) => (
                    <div key={opt.id || oIdx} className="p-3 bg-stone-50/70 rounded-lg border border-stone-200/70">
                      <div className="flex items-center justify-between font-semibold text-stone-800 pb-1.5 border-b border-stone-200">
                        <span>{opt.titulo}</span>
                        {opt.extra && (
                          <span className="font-mono text-[11px] text-stone-500">
                            {opt.extra.kcal} kcal
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 space-y-1 text-stone-600">
                        {opt.itens?.map((item, idx) => (
                          <li key={item.id || idx} className="flex items-start justify-between gap-1.5">
                            <span className="flex items-center gap-1">
                              <span className="text-stone-400">•</span>
                              <span>{item.nome}</span>
                            </span>
                            <span className="font-mono text-[10px] text-stone-500 whitespace-nowrap">
                              {item.medida || `${item.gramas}g`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Diário & Aderência */}
      {activeTab === "diario" && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Registros Enviados via Portal do Paciente
              </h3>
              <p className="text-xs text-stone-500">
                Sincronização instantânea com fotos, consumo de água e refeições consumidas.
              </p>
            </div>
            <Link
              href={portalHref}
              target="_blank"
              className="text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg font-medium"
            >
              Simular Acesso do Paciente
            </Link>
          </div>

          <div className="space-y-3">
            {diary.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{entry.refeicaoNome}</span>
                    <span className="text-[10px] bg-stone-200 px-1.5 py-0.2 rounded font-mono">
                      Opção {entry.opcaoEscolhida}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      Cumprida
                    </span>
                  </div>
                  {entry.notas && (
                    <p className="text-stone-600 mt-1 italic">&quot;{entry.notas}&quot;</p>
                  )}
                  <div className="mt-1.5 text-[11px] text-stone-400">
                    Água ingerida até o momento: <strong>{entry.aguaConsumidaMl}ml</strong> · Avaliação: {entry.avaliacaoEstrelas}/5 ★
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {entry.data}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Exames */}
      {activeTab === "exames" && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">
            Painel de Biomarcadores Laboratoriais
          </h3>
          <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Biomarcador</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Valor de Referência</th>
                  <th className="p-3 text-right">Interpretação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="p-3 font-medium text-stone-900">Glicemia de Jejum</td>
                  <td className="p-3 font-mono font-bold text-stone-800">84 mg/dL</td>
                  <td className="p-3 text-stone-500">70 a 99 mg/dL</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">Normal</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-stone-900">Insulina Basal</td>
                  <td className="p-3 font-mono font-bold text-stone-800">4.2 uUI/mL</td>
                  <td className="p-3 text-stone-500">2.6 a 24.9 uUI/mL</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">Ótimo</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-stone-900">Colesterol Total</td>
                  <td className="p-3 font-mono font-bold text-stone-800">172 mg/dL</td>
                  <td className="p-3 text-stone-500">&lt; 190 mg/dL</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">Normal</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-stone-900">Vitamina D (25-OH)</td>
                  <td className="p-3 font-mono font-bold text-stone-800">48 ng/mL</td>
                  <td className="p-3 text-stone-500">30 a 60 ng/mL</td>
                  <td className="p-3 text-right"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">Adequado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Financeiro */}
      {activeTab === "financeiro" && (
        <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">
            Histórico Financeiro do Paciente
          </h3>
          <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Método</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {financial.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-stone-900">{item.descricao}</td>
                    <td className="p-3 font-mono font-bold text-stone-800">R$ {item.valor.toFixed(2)}</td>
                    <td className="p-3 text-stone-500 font-mono">{item.dataVencimento}</td>
                    <td className="p-3 text-stone-600">{item.metodo}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.status === "pago" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {item.status === "pago" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
