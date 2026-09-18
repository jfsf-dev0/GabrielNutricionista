"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
} from "lucide-react";
import { useNotify } from "@/components/Feedback";
import { getStoredFinancial, getStoredPractitioner } from "@/lib/store";
import { FinancialItem } from "@/lib/types";

export default function FinancialManagementPage() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("todos");
  const notify = useNotify();

  const copyPix = async () => {
    const chave = getStoredPractitioner().chavePix;
    if (!chave) {
      notify("Cadastre a chave PIX em Configurações antes de copiar.", "erro");
      return;
    }
    try {
      await navigator.clipboard.writeText(chave);
      notify("Chave PIX copiada para a área de transferência.", "sucesso");
    } catch {
      notify("Não foi possível copiar automaticamente. Copie manualmente: " + chave, "erro");
    }
  };

  useEffect(() => {
    setItems(getStoredFinancial());
  }, []);

  const totalGeral = items.reduce((acc, i) => acc + i.valor, 0);
  const totalPago = items
    .filter((i) => i.status === "pago")
    .reduce((acc, i) => acc + i.valor, 0);
  const totalPendente = items
    .filter((i) => i.status === "pendente")
    .reduce((acc, i) => acc + i.valor, 0);

  const filtered = items.filter((i) => {
    if (filterStatus === "todos") return true;
    return i.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Controle Financeiro & Honorários
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Módulo M11: Gestão de mensalidades de consultoria, planos trimestrais/semestrais e cobranças PIX.
          </p>
        </div>

        <button
          onClick={copyPix}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs self-start cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Copiar Chave PIX da Clínica</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-stone-500">Faturamento Previsto (Setembro)</div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            R$ {totalGeral.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Total de 4 contratos ativos</div>
        </div>

        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-stone-500">Recebido (Liquidado)</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            R$ {totalPago.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1 font-medium">
            {Math.round((totalPago / (totalGeral || 1)) * 100)}% do total do mês
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-xs font-medium text-stone-500">A Receber / Pendente</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            R$ {totalPendente.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Vencimentos nos próximos 15 dias</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-2xs space-y-3 p-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Lançamentos de Honorários
          </h3>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterStatus("todos")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                filterStatus === "todos" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("pago")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                filterStatus === "pago" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setFilterStatus("pendente")}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                filterStatus === "pendente" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        <div className="border border-stone-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3">Paciente</th>
                <th className="p-3">Descrição do Serviço</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3">Método</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3 font-semibold text-stone-900">
                    <Link href={`/pacientes/${item.pacienteId}`} className="hover:underline">
                      {item.pacienteNome}
                    </Link>
                  </td>
                  <td className="p-3 text-stone-600">{item.descricao}</td>
                  <td className="p-3 text-stone-500 font-mono">{item.dataVencimento}</td>
                  <td className="p-3 text-stone-600 font-mono text-[11px]">{item.metodo}</td>
                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    R$ {item.valor.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.status === "pago"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.status === "pago" ? "Liquidado" : "Aguardando"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
