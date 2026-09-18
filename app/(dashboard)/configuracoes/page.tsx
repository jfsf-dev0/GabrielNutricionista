"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  ShieldCheck,
  Building,
  Save,
  CheckCircle2,
  FileText,
  Lock,
} from "lucide-react";
import { PRACTITIONER_GABRIEL } from "@/lib/store";

export default function SettingsPage() {
  const [nome, setNome] = useState(PRACTITIONER_GABRIEL.nome);
  const [crn, setCrn] = useState(PRACTITIONER_GABRIEL.crn);
  const [titulo, setTitulo] = useState(PRACTITIONER_GABRIEL.titulo);
  const [telefone, setTelefone] = useState(PRACTITIONER_GABRIEL.telefone);
  const [email, setEmail] = useState(PRACTITIONER_GABRIEL.email);
  const [clinica, setClinica] = useState(PRACTITIONER_GABRIEL.clinica);
  const [endereco, setEndereco] = useState(PRACTITIONER_GABRIEL.endereco);
  const [cidade, setCidade] = useState(PRACTITIONER_GABRIEL.cidade);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Configurações do Consultório & Perfil
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Módulo M1: Identidade profissional, número de registro CRN, dados para cabeçalho do Dossiê Editorial A4 e LGPD.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saved ? "Salvo com Sucesso!" : "Salvar Alterações"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Practitioner Card */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <User className="w-4 h-4 text-stone-500" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Identificação do Nutricionista Responsável
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Nome Profissional Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Registro no Conselho Regional de Nutricionistas (CRN) *
              </label>
              <input
                type="text"
                required
                value={crn}
                onChange={(e) => setCrn(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 font-mono focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Título / Especialidade
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                E-mail Profissional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Clinic & Documents */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Building className="w-4 h-4 text-stone-500" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Dados do Consultório (Cabeçalho do Dossiê A4)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Nome da Clínica / Consultoria
              </label>
              <input
                type="text"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Telefone de Contato / WhatsApp
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Cidade & Estado
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-stone-600 font-medium mb-1">
                Endereço Físico Completo
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Document Formatting Standards */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <FileText className="w-4 h-4 text-stone-500" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Padrão Editorial de Impressão (M7)
            </h3>
          </div>

          <div className="space-y-2 text-stone-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dossiê A4 estruturado rigorosamente em 2 páginas sem quebras feias.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tipografia técnica condensada de 9pt para alta densidade informacional.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Estilo monocromático editorial refinado com serif titles para consultoria premium.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
