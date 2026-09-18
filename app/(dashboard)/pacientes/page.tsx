"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Utensils,
  Play,
  Filter,
} from "lucide-react";
import { getStoredPatients, saveStoredPatients } from "@/lib/store";
import { Patient, PatientGoal } from "@/lib/types";

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filterGoal, setFilterGoal] = useState<string>("Todos");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New patient form state
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTelefone, setNewTelefone] = useState("");
  const [newIdade, setNewIdade] = useState(25);
  const [newGenero, setNewGenero] = useState<"M" | "F">("M");
  const [newObjetivo, setNewObjetivo] = useState<PatientGoal>("Hipertrofia");
  const [newPeso, setNewPeso] = useState(70);
  const [newAltura, setNewAltura] = useState(175);

  useEffect(() => {
    setPatients(getStoredPatients());
  }, []);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) return;

    const id = `pac-${newNome.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const imc = Number((newPeso / ((newAltura / 100) * (newAltura / 100))).toFixed(1));
    const tmb = newGenero === "M" ? Math.round(10 * newPeso + 6.25 * newAltura - 5 * newIdade + 5) : Math.round(10 * newPeso + 6.25 * newAltura - 5 * newIdade - 161);

    const newPatient: Patient = {
      id,
      nome: newNome,
      email: newEmail || `${id}@paciente.com`,
      telefone: newTelefone || "(11) 90000-0000",
      dataNascimento: "2000-01-01",
      idade: Number(newIdade),
      genero: newGenero,
      objetivo: newObjetivo,
      status: "ativo",
      restricoes: ["A definir em anamnese"],
      dadosAntropometricos: {
        peso: Number(newPeso),
        altura: Number(newAltura),
        imc,
        tmb,
        get: Math.round(tmb * 1.55),
        percentualGordura: 16.0,
        massaMagraKg: Number((newPeso * 0.84).toFixed(1)),
        massaGordaKg: Number((newPeso * 0.16).toFixed(1)),
      },
      planoAtivoId: `plano-${id}`,
      ultimaConsulta: new Date().toLocaleDateString("pt-BR"),
      adesaoMedia7d: 100,
      streakDias: 0,
      notasClinicas: "Paciente cadastrado para nova avaliação nutricional.",
    };

    const updated = [newPatient, ...patients];
    setPatients(updated);
    saveStoredPatients(updated);
    setIsNewModalOpen(false);

    // Reset fields
    setNewNome("");
    setNewEmail("");
    setNewTelefone("");
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.objetivo.toLowerCase().includes(search.toLowerCase());

    const matchesGoal = filterGoal === "Todos" || p.objetivo === filterGoal;
    const matchesStatus = filterStatus === "Todos" || p.status === filterStatus;

    return matchesSearch && matchesGoal && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Fichas & Prontuários dos Pacientes
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Gestão clínica integral, metas antropométricas, diário PWA e histórico de consultas.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs self-start cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-stone-200/80 p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou objetivo..."
            className="w-full bg-transparent text-stone-800 placeholder-stone-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-stone-400 flex items-center gap-1 text-[11px] shrink-0">
            <Filter className="w-3 h-3" />
            <span>Filtrar:</span>
          </span>

          <select
            value={filterGoal}
            onChange={(e) => setFilterGoal(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-700 text-xs focus:outline-hidden"
          >
            <option value="Todos">Todos Objetivos</option>
            <option value="Hipertrofia">Hipertrofia</option>
            <option value="Emagrecimento">Emagrecimento</option>
            <option value="Performance">Performance</option>
            <option value="Saúde & Longevidade">Saúde & Longevidade</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-700 text-xs focus:outline-hidden"
          >
            <option value="Todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="alerta">Em Alerta</option>
          </select>
        </div>
      </div>

      {/* Patients Table / Grid */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-semibold font-mono">
              <tr>
                <th className="px-5 py-3">Paciente</th>
                <th className="px-4 py-3">Objetivo & Idade</th>
                <th className="px-4 py-3">Dados Antropométricos</th>
                <th className="px-4 py-3">Aderência 7d</th>
                <th className="px-4 py-3">Última Consulta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => {
                const isAlert = p.status === "alerta";
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-stone-50/80 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 text-stone-800 font-bold flex items-center justify-center text-xs">
                          {p.nome.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/pacientes/${p.id}`}
                            className="font-bold text-stone-900 group-hover:underline text-xs"
                          >
                            {p.nome}
                          </Link>
                          <div className="text-[11px] text-stone-400">
                            {p.email} · {p.telefone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-stone-800">{p.objetivo}</div>
                      <div className="text-[11px] text-stone-400">
                        {p.idade} anos ({p.genero === "M" ? "Masc" : "Fem"})
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono tabular-nums text-stone-900">
                        {p.dadosAntropometricos.peso} kg · {p.dadosAntropometricos.altura} cm
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        IMC: {p.dadosAntropometricos.imc} · BF: {p.dadosAntropometricos.percentualGordura}%
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.adesaoMedia7d >= 80
                                ? "bg-emerald-500"
                                : p.adesaoMedia7d >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${p.adesaoMedia7d}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums font-semibold text-stone-800">
                          {p.adesaoMedia7d}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-stone-500">
                      <div className="font-mono text-[11px]">{p.ultimaConsulta}</div>
                      {p.proximaConsulta && (
                        <div className="text-[10px] text-stone-400">
                          Próx: {p.proximaConsulta}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Em Atenção</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Ativo</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/consulta/${p.id}`}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition-colors"
                          title="Iniciar Consulta (W4)"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/planos/${p.id}`}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition-colors"
                          title="Ver / Editar Plano Alimentar"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/pacientes/${p.id}`}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium text-xs transition-colors"
                        >
                          Abrir Ficha
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Paciente */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">
                Cadastrar Novo Paciente
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="ex: Lucas Martins"
                  className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="lucas@exemplo.com"
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newTelefone}
                    onChange={(e) => setNewTelefone(e.target.value)}
                    placeholder="(11) 99888-7766"
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Idade (anos)
                  </label>
                  <input
                    type="number"
                    value={newIdade}
                    onChange={(e) => setNewIdade(Number(e.target.value))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Gênero
                  </label>
                  <select
                    value={newGenero}
                    onChange={(e) => setNewGenero(e.target.value as "M" | "F")}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Objetivo
                  </label>
                  <select
                    value={newObjetivo}
                    onChange={(e) => setNewObjetivo(e.target.value as PatientGoal)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  >
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Performance">Performance</option>
                    <option value="Saúde & Longevidade">Saúde & Longevidade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPeso}
                    onChange={(e) => setNewPeso(Number(e.target.value))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={newAltura}
                    onChange={(e) => setNewAltura(Number(e.target.value))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-hidden focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-lg font-medium shadow-xs"
                >
                  Salvar e Criar Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
