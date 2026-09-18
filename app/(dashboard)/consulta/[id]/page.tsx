"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  BookOpen,
  Utensils,
  Save,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  getStoredPatients,
  saveStoredPatients,
  getStoredConsultations,
  saveStoredConsultations,
  getStoredPlanProfile,
} from "@/lib/store";
import { Patient, Consultation, PatientProfile } from "@/lib/types";
import { calcIMC, calcBodyComposition } from "@/lib/calc";

export default function ConsultationLivePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = (params?.id as string) || "pac-joao-freire";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Clinical form fields
  const [queixaAtual, setQueixaAtual] = useState("");
  const [pesoHoje, setPesoHoje] = useState<number>(76.5);
  const [cinturaHoje, setCinturaHoje] = useState<number>(78.5);
  const [abdomeHoje, setAbdomeHoje] = useState<number>(81.0);
  const [sonoDisposicao, setSonoDisposicao] = useState("Sono regular de 7h a 8h, boa recuperação muscular.");
  const [sintomasGI, setSintomasGI] = useState("Sem queixas gastrointestinais. Sem distensão abdominal.");
  const [condutaFinal, setCondutaFinal] = useState("");

  useEffect(() => {
    const all = getStoredPatients();
    const p = all.find((x) => x.id === patientId) || all[0];
    if (p) {
      setPatient(p);
      setPesoHoje(p.dadosAntropometricos.peso);
      if (p.dadosAntropometricos.circunferencias?.cintura) {
        setCinturaHoje(p.dadosAntropometricos.circunferencias.cintura);
      }
      if (p.dadosAntropometricos.circunferencias?.abdome) {
        setAbdomeHoje(p.dadosAntropometricos.circunferencias.abdome);
      }
      setQueixaAtual(`Acompanhamento de protocolo ${p.objetivo.toLowerCase()}. Avaliação de resposta e aderência.`);
      setCondutaFinal(`Manutenção do aporte calórico e densidade proteica com foco em ${p.objetivo.toLowerCase()}.`);
    }
    setProfile(getStoredPlanProfile(patientId));
  }, [patientId]);

  // Consultation timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleFinishConsultation = () => {
    if (!patient) return;

    // 1. Update patient with new weight and consultation record
    const allPatients = getStoredPatients();
    const deltaPeso = Number((pesoHoje - patient.dadosAntropometricos.peso).toFixed(1));
    const newIMC = calcIMC(pesoHoje, patient.dadosAntropometricos.altura).imc;

    const updatedPatients = allPatients.map((p) => {
      if (p.id === patient.id) {
        return {
          ...p,
          dadosAntropometricos: {
            ...p.dadosAntropometricos,
            peso: pesoHoje,
            imc: newIMC,
            circunferencias: {
              ...p.dadosAntropometricos.circunferencias,
              cintura: cinturaHoje,
              abdome: abdomeHoje,
            },
          },
          ultimaConsulta: new Date().toLocaleDateString("pt-BR"),
          notasClinicas: `${condutaFinal} (Aferição: ${pesoHoje} kg, variação ${deltaPeso > 0 ? "+" : ""}${deltaPeso}kg).`,
        };
      }
      return p;
    });

    saveStoredPatients(updatedPatients);

    // 2. Add or update consultation
    const allConsultations = getStoredConsultations();
    const newCons: Consultation = {
      id: `cons-${Date.now()}`,
      pacienteId: patient.id,
      pacienteNome: patient.nome,
      dataHora: new Date().toISOString(),
      horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      duracaoMinutos: Math.max(1, Math.round(seconds / 60)),
      status: "realizada",
      tipo: "presencial",
      queixaPrincipal: queixaAtual,
      pesoAferido: pesoHoje,
      conduta: condutaFinal,
    };

    saveStoredConsultations([newCons, ...allConsultations]);

    alert("Consulta finalizada com sucesso! Prontuário e métricas atualizados.");
    router.push(`/pacientes/${patient.id}`);
  };

  if (!patient || !profile) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        Carregando modo consulta...
      </div>
    );
  }

  const pesoAnterior = patient.dadosAntropometricos.peso;
  const diferencaPeso = Number((pesoHoje - pesoAnterior).toFixed(1));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Consultation Header with Timer (Discovery W4) */}
      <div className="bg-stone-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/pacientes/${patient.id}`}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium">
                Modo Consulta Ativo
              </span>
              <span className="text-xs text-stone-400">· Presencial</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Atendimento Clínico: {patient.nome}
            </h2>
            <div className="text-xs text-stone-400">
              {patient.idade} anos · Objetivo: <strong className="text-stone-200">{patient.objetivo}</strong> · Plano Vigente: {profile.calorias} kcal
            </div>
          </div>
        </div>

        {/* Live Timer & Finish Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-sm font-bold text-white tabular-nums">
              {formatTimer(seconds)}
            </span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-stone-400 hover:text-white text-[11px] ml-1 p-0.5"
              title={timerRunning ? "Pausar cronômetro" : "Retomar cronômetro"}
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={handleFinishConsultation}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Consulta</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Clinical Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Anamnesis & Physical Assessment */}
        <div className="lg:col-span-2 space-y-5">
          {/* Bloco 1: Queixas & Evolução Qualitativa */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span>01. Queixa Principal & Relato da Rotina</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">Fase Atual: {profile.fase}</span>
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                O que mudou desde a última consulta? (Rotina de treinos, trabalho, viagens)
              </label>
              <textarea
                rows={3}
                value={queixaAtual}
                onChange={(e) => setQueixaAtual(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">
                  Sono & Disposição
                </label>
                <input
                  type="text"
                  value={sonoDisposicao}
                  onChange={(e) => setSonoDisposicao(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-xs text-stone-800 focus:outline-hidden focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">
                  Sintomas Gastrointestinais & Intestino
                </label>
                <input
                  type="text"
                  value={sintomasGI}
                  onChange={(e) => setSintomasGI(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-xs text-stone-800 focus:outline-hidden focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Bloco 2: Aferição Antropométrica Rápida */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-stone-500" />
                <span>02. Aferição Antropométrica de Hoje</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">Balança de Bioimpedância</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Peso Aferido (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoHoje}
                  onChange={(e) => setPesoHoje(Number(e.target.value))}
                  className="w-full text-xl font-bold font-mono text-stone-900 bg-white border border-stone-300 rounded p-1.5 outline-none"
                />
                <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                  {diferencaPeso > 0 ? (
                    <span className="text-emerald-700 flex items-center font-medium">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +{diferencaPeso} kg
                    </span>
                  ) : diferencaPeso < 0 ? (
                    <span className="text-blue-700 flex items-center font-medium">
                      <TrendingDown className="w-3 h-3 mr-0.5" /> {diferencaPeso} kg
                    </span>
                  ) : (
                    <span className="text-stone-500">Sem variação</span>
                  )}
                  <span className="text-stone-400 text-[10px]">vs última consulta</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={cinturaHoje}
                  onChange={(e) => setCinturaHoje(Number(e.target.value))}
                  className="w-full text-xl font-bold font-mono text-stone-900 bg-white border border-stone-300 rounded p-1.5 outline-none"
                />
                <div className="mt-1.5 text-[10px] text-stone-400">
                  Ponto médio entre crista ilíaca e costela
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-1">
                  Abdômen (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={abdomeHoje}
                  onChange={(e) => setAbdomeHoje(Number(e.target.value))}
                  className="w-full text-xl font-bold font-mono text-stone-900 bg-white border border-stone-300 rounded p-1.5 outline-none"
                />
                <div className="mt-1.5 text-[10px] text-stone-400">
                  Cicatriz umbilical
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 3: Conduta & Próximos Passos */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              <span>03. Conduta Clínica Registrada</span>
            </h3>
            <textarea
              rows={3}
              value={condutaFinal}
              onChange={(e) => setCondutaFinal(e.target.value)}
              placeholder="Descreva a conduta nutricional decidida nesta consulta..."
              className="w-full border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 focus:outline-hidden focus:border-stone-900"
            />
          </div>
        </div>

        {/* Right Col: Active Plan Overview & Action Hub */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Plano em Execução
              </h3>
              <Link
                href={`/planos/${patient.id}`}
                className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium"
              >
                Abrir Construtor
              </Link>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">Meta Calórica:</span>
                <strong className="text-stone-900">{profile.calorias} kcal</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Proteínas:</span>
                <strong className="text-stone-900">{profile.prot}g (30%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Carboidratos:</span>
                <strong className="text-stone-900">{profile.carbo}g (41%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Lipídios:</span>
                <strong className="text-stone-900">{profile.gord}g (29%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hidratação:</span>
                <strong className="text-stone-900">{profile.agua}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] font-semibold text-stone-800 mb-1.5">
                Suplementação Prescrita
              </div>
              <ul className="space-y-1 text-xs text-stone-600">
                {profile.suplementos.map((s, i) => (
                  <li key={i} className="flex justify-between text-[11px]">
                    <span className="font-medium text-stone-800">{s.nome}:</span>
                    <span className="text-stone-500">{s.posologia}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-stone-800 mb-1">
              Atalhos Rápidos Durante Consulta:
            </div>
            <Link
              href={`/planos/${patient.id}?print=true`}
              target="_blank"
              className="w-full py-2 px-3 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-stone-700 flex items-center justify-between transition-colors"
            >
              <span>Ver Dossiê Editorial A4 (9pt)</span>
              <span>↗</span>
            </Link>
            <Link
              href="/alimentos"
              target="_blank"
              className="w-full py-2 px-3 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-stone-700 flex items-center justify-between transition-colors"
            >
              <span>Consultar Tabela TACO</span>
              <span>↗</span>
            </Link>
            <Link
              href="/avaliacoes"
              target="_blank"
              className="w-full py-2 px-3 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-stone-700 flex items-center justify-between transition-colors"
            >
              <span>Calculadora Jackson-Pollock</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
