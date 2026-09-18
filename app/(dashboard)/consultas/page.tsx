"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Clock,
  Play,
  CheckCircle2,
  Users,
  Video,
  MapPin,
  ChevronRight,
} from "lucide-react";
import {
  getStoredConsultations,
  saveStoredConsultations,
  getStoredPatients,
} from "@/lib/store";
import { Consultation, Patient } from "@/lib/types";

export default function ConsultationsAgendaPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filterType, setFilterType] = useState("todos");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New consultation fields
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [horario, setHorario] = useState("14:00");
  const [data, setData] = useState("2026-09-18");
  const [tipo, setTipo] = useState<"presencial" | "online">("presencial");
  const [queixa, setQueixa] = useState("");

  useEffect(() => {
    const cons = getStoredConsultations();
    const pats = getStoredPatients();
    setConsultations(cons);
    setPatients(pats);
    if (pats.length > 0) setSelectedPatientId(pats[0].id);
  }, []);

  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    const newCons: Consultation = {
      id: `cons-${Date.now()}`,
      pacienteId: pat.id,
      pacienteNome: pat.nome,
      dataHora: `${data}T${horario}:00`,
      horario,
      duracaoMinutos: 60,
      status: "agendada",
      tipo,
      queixaPrincipal: queixa || "Consulta de rotina",
    };

    const updated = [newCons, ...consultations];
    setConsultations(updated);
    saveStoredConsultations(updated);
    setIsNewModalOpen(false);
    setQueixa("");
  };

  const filtered = consultations.filter((c) => {
    if (filterType === "todos") return true;
    return c.status === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Agenda & Consultas Clínicas
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gestão de agendamentos presenciais, teleconsultas e fluxo direto para o Modo Consulta (W4).
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs self-start cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agendar Nova Consulta</span>
        </button>
      </div>

      {/* Agenda Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs">
        <button
          onClick={() => setFilterType("todos")}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === "todos"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Todas ({consultations.length})
        </button>
        <button
          onClick={() => setFilterType("agendada")}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === "agendada"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Agendadas ({consultations.filter((c) => c.status === "agendada").length})
        </button>
        <button
          onClick={() => setFilterType("realizada")}
          className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
            filterType === "realizada"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Realizadas ({consultations.filter((c) => c.status === "realizada").length})
        </button>
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const isRealizada = c.status === "realizada";
          return (
            <div
              key={c.id}
              className={`p-4 bg-white border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs ${
                isRealizada
                  ? "border-stone-200/60 bg-stone-50/40"
                  : "border-stone-200 hover:border-stone-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 font-mono text-center shrink-0">
                  <span className="text-xs font-bold text-stone-900">{c.horario}</span>
                  <span className="text-[10px] text-stone-400">{c.duracaoMinutos}m</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pacientes/${c.pacienteId}`}
                      className="font-bold text-sm text-stone-900 hover:underline"
                    >
                      {c.pacienteNome}
                    </Link>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                        c.tipo === "presencial"
                          ? "bg-stone-100 text-stone-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {c.tipo === "presencial" ? (
                        <>
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Presencial</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-2.5 h-2.5" />
                          <span>Teleconsulta</span>
                        </>
                      )}
                    </span>
                    {isRealizada && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Realizada</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 mt-1 max-w-xl">
                    {c.queixaPrincipal || "Consulta de rotina clínica e acompanhamento dietético."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {isRealizada ? (
                  <Link
                    href={`/pacientes/${c.pacienteId}`}
                    className="px-3 py-1.5 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Ver Prontuário
                  </Link>
                ) : (
                  <Link
                    href={`/consulta/${c.pacienteId}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar Modo Consulta (W4)</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Consultation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">
                Agendar Nova Consulta
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Paciente
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg p-2 text-stone-900"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.objetivo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg p-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Modalidade
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as "presencial" | "online")}
                  className="w-full border border-stone-300 rounded-lg p-2 text-stone-900"
                >
                  <option value="presencial">Presencial (Consultório)</option>
                  <option value="online">Teleconsulta (Vídeo)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Motivo / Queixa Principal
                </label>
                <input
                  type="text"
                  value={queixa}
                  onChange={(e) => setQueixa(e.target.value)}
                  placeholder="ex: Avaliação de bioimpedância e ajuste de macros"
                  className="w-full border border-stone-300 rounded-lg p-2 text-stone-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-medium"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
