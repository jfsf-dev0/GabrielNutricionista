"use client";

import React from "react";
import { PatientProfile } from "@/lib/types";

interface ReportPreviewProps {
  profile: PatientProfile;
}

export default function ReportPreview({ profile }: ReportPreviewProps) {
  const renderItens = (itens: string[]) => {
    return itens.map((item, idx) => {
      if (item.startsWith("↳") || item.startsWith("*") || item.startsWith("—")) {
        return (
          <li key={idx} className="text-[7pt] text-stone-500 pl-2 border-l border-stone-200">
            {item}
          </li>
        );
      }
      const parts = item.split("|");
      const name = parts[0].trim();
      const qty = parts[1] ? parts[1].trim() : "";
      return (
        <li key={idx} className="flex justify-between">
          <span>{name}</span>
          <span className="font-medium">{qty}</span>
        </li>
      );
    });
  };

  const m1 = profile.meals[1] || profile.meals[Object.keys(profile.meals)[0] as unknown as number];
  const m2 = profile.meals[2] || m1;
  const m3 = profile.meals[3] || m1;
  const m4 = profile.meals[4] || m1;

  return (
    <main className="flex-1 bg-stone-200/60 overflow-y-auto p-4 md:p-8 flex flex-col items-center print-container">
      {/* Aviso Superior no Preview (Oculto na Impressão) */}
      <div className="no-print w-full max-w-[210mm] mb-3 flex items-center justify-between text-xs text-stone-500">
        <span>Preview Editorial em Tempo Real (Fonte 9pt · 2 Páginas)</span>
        <span className="text-[11px] text-stone-400">Dimensão física: A4 (210 × 297 mm)</span>
      </div>

      {/* ========================================================================= */}
      {/* PÁGINA 1: CABEÇALHO + SUPLEMENTAÇÃO + CAFÉ DA MANHÃ + ALMOÇO               */}
      {/* ========================================================================= */}
      <section className="a4-sheet flex flex-col justify-between">
        <div>
          {/* Header Institucional */}
          <header className="flex justify-between items-baseline hairline-b pb-2">
            <div>
              <span className="text-[7pt] tracking-[0.2em] uppercase text-stone-400 font-medium block">
                Consultoria de Nutrição Clínica & Performance
              </span>
              <span className="text-[9.5pt] font-semibold tracking-tight text-stone-900">
                {profile.nutricionista}
              </span>
              <span className="text-[7.5pt] text-stone-400 ml-2">{profile.crn}</span>
            </div>
            <div className="text-right text-[7.5pt] text-stone-400">
              {profile.local} &nbsp;·&nbsp; {profile.telefone}
            </div>
          </header>

          {/* Título & Paciente */}
          <div className="mt-3.5 mb-2.5 flex items-baseline justify-between">
            <div>
              <h1 className="font-serif-title text-[16pt] font-normal tracking-tight text-stone-900 leading-tight">
                Planejamento Alimentar Individualizado
              </h1>
              <p className="text-[7.5pt] text-stone-400 font-light mt-0.5">
                Prescrição clínica para manutenção metabólica, composição corporal e rendimento físico.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[7pt] text-stone-400 uppercase tracking-wider block">Paciente</span>
              <span className="text-[10pt] font-medium text-stone-900">{profile.paciente}</span>
            </div>
          </div>

          {/* Faixa de Macros (9pt) */}
          <div className="grid grid-cols-6 hairline-all bg-stone-50/70 text-center py-1.5 px-1 mb-3.5 text-[8pt]">
            <div className="border-r border-stone-200">
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Valor Energético</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.calorias}
              </span>
              <span className="text-[7pt] text-stone-500 ml-0.5">kcal</span>
            </div>
            <div className="border-r border-stone-200">
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Proteínas</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.prot}
              </span>
              <span className="text-[7pt] text-stone-500 ml-0.5">g (30%)</span>
            </div>
            <div className="border-r border-stone-200">
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Carboidratos</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.carbo}
              </span>
              <span className="text-[7pt] text-stone-500 ml-0.5">g (41%)</span>
            </div>
            <div className="border-r border-stone-200">
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Lipídios</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.gord}
              </span>
              <span className="text-[7pt] text-stone-500 ml-0.5">g (29%)</span>
            </div>
            <div className="border-r border-stone-200">
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Fibras</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.fibras}
              </span>
              <span className="text-[7pt] text-stone-500 ml-0.5">g</span>
            </div>
            <div>
              <span className="text-[6.5pt] text-stone-400 block uppercase tracking-wider">Meta Hídrica</span>
              <span className="font-serif-title text-[10.5pt] text-stone-900 font-medium tabular-nums">
                {profile.agua}
              </span>
            </div>
          </div>

          {/* 01. Conduta Clínica & Suplementação */}
          <div className="mb-3.5">
            <div className="flex justify-between items-baseline mb-1">
              <h2 className="text-[7.5pt] tracking-[0.18em] uppercase text-stone-400 font-semibold">
                01. Conduta Clínica & Suplementação
              </h2>
              <span className="text-[7pt] text-stone-400">{profile.data}</span>
            </div>
            <table className="w-full text-left hairline-all text-[7.8pt]">
              <thead className="bg-stone-50 text-[6.8pt] uppercase tracking-wider text-stone-400 hairline-b">
                <tr>
                  <th className="py-1 px-2 w-[25%]">Composto</th>
                  <th className="py-1 px-2 w-[25%]">Posologia & Horário</th>
                  <th className="py-1 px-2 w-[50%]">Diretriz Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                {profile.suplementos.map((sup, idx) => (
                  <tr key={sup.id || idx}>
                    <td className="py-1 px-2 font-medium text-stone-900">{sup.nome}</td>
                    <td className="py-1 px-2">{sup.posologia}</td>
                    <td className="py-1 px-2 text-[7.2pt] text-stone-600">{sup.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 02. Estrutura Alimentar — Manhã e Almoço */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <h2 className="text-[7.5pt] tracking-[0.18em] uppercase text-stone-400 font-semibold">
                02. Estrutura Alimentar — Manhã e Almoço
              </h2>
            </div>

            {/* Café da Manhã */}
            <div className="mb-3.5">
              <div className="flex justify-between items-baseline hairline-b pb-0.5 mb-1.5 text-[8.2pt]">
                <span className="font-semibold text-stone-900">
                  {m1.nome} &nbsp;
                  <span className="text-stone-400 font-normal text-[7.2pt]">· Sugerido: {m1.horario}</span>
                </span>
                <span className="text-[7.2pt] text-stone-500 tabular-nums">
                  ~{m1.optA.cal} a {m1.optB.cal} kcal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[8pt] leading-[11pt]">
                {/* Opção A */}
                <div className="pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-stone-900">{m1.optA.titulo}</span>
                    <span className="text-[7.2pt] text-stone-500 tabular-nums">{m1.optA.cal} kcal</span>
                  </div>
                  <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                    P: {m1.optA.p}g · C: {m1.optA.c}g · L: {m1.optA.l}g
                  </div>
                  <ul className="space-y-0.5 text-stone-700">{renderItens(m1.optA.itens)}</ul>
                </div>

                {/* Opção B */}
                <div className="pl-2 border-l border-stone-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-stone-900">{m1.optB.titulo}</span>
                    <span className="text-[7.2pt] text-stone-500 tabular-nums">{m1.optB.cal} kcal</span>
                  </div>
                  <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                    P: {m1.optB.p}g · C: {m1.optB.c}g · L: {m1.optB.l}g
                  </div>
                  <ul className="space-y-0.5 text-stone-700">{renderItens(m1.optB.itens)}</ul>
                </div>
              </div>
            </div>

            {/* Almoço */}
            <div>
              <div className="flex justify-between items-baseline hairline-b pb-0.5 mb-1.5 text-[8.2pt]">
                <span className="font-semibold text-stone-900">
                  {m2.nome} &nbsp;
                  <span className="text-stone-400 font-normal text-[7.2pt]">· Sugerido: {m2.horario}</span>
                </span>
                <span className="text-[7.2pt] text-stone-500 tabular-nums">
                  ~{m2.optA.cal} a {m2.optB.cal} kcal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[8pt] leading-[11pt]">
                <div className="pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-stone-900">{m2.optA.titulo}</span>
                    <span className="text-[7.2pt] text-stone-500 tabular-nums">{m2.optA.cal} kcal</span>
                  </div>
                  <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                    P: {m2.optA.p}g · C: {m2.optA.c}g · L: {m2.optA.l}g
                  </div>
                  <ul className="space-y-0.5 text-stone-700">{renderItens(m2.optA.itens)}</ul>
                </div>

                <div className="pl-2 border-l border-stone-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-stone-900">{m2.optB.titulo}</span>
                    <span className="text-[7.2pt] text-stone-500 tabular-nums">{m2.optB.cal} kcal</span>
                  </div>
                  <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                    P: {m2.optB.p}g · C: {m2.optB.c}g · L: {m2.optB.l}g
                  </div>
                  <ul className="space-y-0.5 text-stone-700">{renderItens(m2.optB.itens)}</ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Página 1 */}
        <footer className="pt-1.5 hairline-t flex justify-between items-center text-[7pt] text-stone-400 mt-2">
          <span>
            {profile.nutricionista} · {profile.crn} · Plano Alimentar Personalizado
          </span>
          <span>Página 1 de 2</span>
        </footer>
      </section>

      {/* ========================================================================= */}
      {/* PÁGINA 2: LANCHE + JANTAR + RECEITA + BALANÇO NUTRICIONAL + ASSINATURA     */}
      {/* ========================================================================= */}
      <section className="a4-sheet flex flex-col justify-between">
        <div>
          {/* Header Pág 2 */}
          <header className="flex justify-between items-baseline hairline-b pb-1.5 mb-2.5 text-[7.5pt] text-stone-400">
            <span>GABRIEL ALVES DA SILVA — NUTRIÇÃO CLÍNICA & ESPORTIVA</span>
            <span>PLANO ALIMENTAR: {profile.paciente.toUpperCase()} · PÁGINA 2 DE 2</span>
          </header>

          {/* 03. Lanche da Tarde */}
          <div className="mb-3">
            <div className="flex justify-between items-baseline hairline-b pb-0.5 mb-1.5 text-[8.2pt]">
              <span className="font-semibold text-stone-900">
                {m3.nome} &nbsp;
                <span className="text-stone-400 font-normal text-[7.2pt]">· Sugerido: {m3.horario}</span>
              </span>
              <span className="text-[7.2pt] text-stone-500 tabular-nums">
                ~{m3.optA.cal} a {m3.optB.cal} kcal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[8pt] leading-[11pt]">
              <div className="pr-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-medium text-stone-900">{m3.optA.titulo}</span>
                  <span className="text-[7.2pt] text-stone-500 tabular-nums">{m3.optA.cal} kcal</span>
                </div>
                <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                  P: {m3.optA.p}g · C: {m3.optA.c}g · L: {m3.optA.l}g
                </div>
                <ul className="space-y-0.5 text-stone-700">{renderItens(m3.optA.itens)}</ul>
              </div>

              <div className="pl-2 border-l border-stone-200">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-medium text-stone-900">{m3.optB.titulo}</span>
                  <span className="text-[7.2pt] text-stone-500 tabular-nums">{m3.optB.cal} kcal</span>
                </div>
                <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                  P: {m3.optB.p}g · C: {m3.optB.c}g · L: {m3.optB.l}g
                </div>
                <ul className="space-y-0.5 text-stone-700">{renderItens(m3.optB.itens)}</ul>
              </div>
            </div>
          </div>

          {/* 04. Jantar */}
          <div className="mb-3">
            <div className="flex justify-between items-baseline hairline-b pb-0.5 mb-1.5 text-[8.2pt]">
              <span className="font-semibold text-stone-900">
                {m4.nome} &nbsp;
                <span className="text-stone-400 font-normal text-[7.2pt]">· Sugerido: {m4.horario}</span>
              </span>
              <span className="text-[7.2pt] text-stone-500 tabular-nums">
                ~{m4.optA.cal} a {m4.optB.cal} kcal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[8pt] leading-[11pt]">
              <div className="pr-2">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-medium text-stone-900">{m4.optA.titulo}</span>
                  <span className="text-[7.2pt] text-stone-500 tabular-nums">{m4.optA.cal} kcal</span>
                </div>
                <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                  P: {m4.optA.p}g · C: {m4.optA.c}g · L: {m4.optA.l}g
                </div>
                <ul className="space-y-0.5 text-stone-700">{renderItens(m4.optA.itens)}</ul>
              </div>

              <div className="pl-2 border-l border-stone-200">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-medium text-stone-900">{m4.optB.titulo}</span>
                  <span className="text-[7.2pt] text-stone-500 tabular-nums">{m4.optB.cal} kcal</span>
                </div>
                <div className="text-[6.8pt] text-stone-400 mb-1 tabular-nums">
                  P: {m4.optB.p}g · C: {m4.optB.c}g · L: {m4.optB.l}g
                </div>
                <ul className="space-y-0.5 text-stone-700">{renderItens(m4.optB.itens)}</ul>
              </div>
            </div>
          </div>

          {/* Receita Funcional */}
          <div className="hairline-all bg-stone-50/50 p-2 mb-3 text-[7.8pt] leading-[11pt]">
            <div className="flex justify-between items-baseline hairline-b pb-1 mb-1">
              <span className="font-semibold text-stone-900 uppercase tracking-wider text-[7pt]">
                Receituário: {profile.receita.nome}
              </span>
              <span className="text-stone-400 text-[6.8pt]">{profile.receita.rendimento}</span>
            </div>
            <div className="grid grid-cols-12 gap-3 text-stone-700">
              <div className="col-span-5 border-r border-stone-200 pr-2">
                <b>Ingredientes:</b> {profile.receita.ingredientes}
              </div>
              <div className="col-span-7">
                <b>Modo de Preparo:</b> {profile.receita.preparo}
              </div>
            </div>
          </div>

          {/* Demonstrativo Nutricional */}
          <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
              <h2 className="text-[7.5pt] tracking-[0.18em] uppercase text-stone-400 font-semibold">
                03. Demonstrativo Nutricional & Micronutrientes
              </h2>
              <span className="text-[6.8pt] text-stone-400">Auditoria Completa</span>
            </div>

            {/* Tabela de Refeições */}
            <table className="w-full text-left hairline-all text-[7.5pt] mb-1.5">
              <thead className="bg-stone-50 text-[6.8pt] uppercase tracking-wider text-stone-400 hairline-b">
                <tr>
                  <th className="py-1 px-2">Refeição Cadastrada</th>
                  <th className="py-1 px-2 text-center">Proteínas</th>
                  <th className="py-1 px-2 text-center">Lipídios</th>
                  <th className="py-1 px-2 text-center">Carboidratos</th>
                  <th className="py-1 px-2 text-right">Calorias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700 tabular-nums">
                <tr>
                  <td className="py-1 px-2">Café da Manhã (Opção A / B)</td>
                  <td className="py-1 px-2 text-center">
                    {m1.optA.p}g / {m1.optB.p}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m1.optA.l}g / {m1.optB.l}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m1.optA.c}g / {m1.optB.c}g
                  </td>
                  <td className="py-1 px-2 text-right">
                    {m1.optA.cal} / {m1.optB.cal} kcal
                  </td>
                </tr>
                <tr>
                  <td className="py-1 px-2">Almoço (Opção A / B)</td>
                  <td className="py-1 px-2 text-center">
                    {m2.optA.p}g / {m2.optB.p}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m2.optA.l}g / {m2.optB.l}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m2.optA.c}g / {m2.optB.c}g
                  </td>
                  <td className="py-1 px-2 text-right">
                    {m2.optA.cal} / {m2.optB.cal} kcal
                  </td>
                </tr>
                <tr>
                  <td className="py-1 px-2">Lanche da Tarde (Opção A / B)</td>
                  <td className="py-1 px-2 text-center">
                    {m3.optA.p}g / {m3.optB.p}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m3.optA.l}g / {m3.optB.l}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m3.optA.c}g / {m3.optB.c}g
                  </td>
                  <td className="py-1 px-2 text-right">
                    {m3.optA.cal} / {m3.optB.cal} kcal
                  </td>
                </tr>
                <tr>
                  <td className="py-1 px-2">Jantar (Opção A / B)</td>
                  <td className="py-1 px-2 text-center">
                    {m4.optA.p}g / {m4.optB.p}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m4.optA.l}g / {m4.optB.l}g
                  </td>
                  <td className="py-1 px-2 text-center">
                    {m4.optA.c}g / {m4.optB.c}g
                  </td>
                  <td className="py-1 px-2 text-right">
                    {m4.optA.cal} / {m4.optB.cal} kcal
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-50 font-semibold text-stone-900 hairline-t tabular-nums">
                <tr>
                  <td className="py-1 px-2">MÉDIA DIÁRIA TOTAL CONSOLIDADA</td>
                  <td className="py-1 px-2 text-center">{profile.prot} g</td>
                  <td className="py-1 px-2 text-center">{profile.gord} g</td>
                  <td className="py-1 px-2 text-center">{profile.carbo} g</td>
                  <td className="py-1 px-2 text-right">{profile.calorias} kcal</td>
                </tr>
              </tfoot>
            </table>

            {/* Matriz de Micronutrientes (3 Linhas Refinadas) */}
            <div className="hairline-all divide-y divide-stone-200 text-[7.2pt] leading-[9.5pt] p-2 bg-stone-50/40 text-stone-600">
              <div
                className="pb-1"
                dangerouslySetInnerHTML={{ __html: profile.lipideosStr }}
              />
              <div
                className="py-1"
                dangerouslySetInnerHTML={{ __html: profile.mineraisStr }}
              />
              <div
                className="pt-1"
                dangerouslySetInnerHTML={{ __html: profile.vitaminasStr }}
              />
            </div>
          </div>

          {/* Assinatura Final */}
          <div className="hairline-t pt-1.5 flex justify-between items-baseline text-[7.2pt] text-stone-500">
            <div>
              Documento técnico emitido em conformidade com as diretrizes do Conselho Federal de Nutricionistas (CFN).
            </div>
            <div className="text-right">
              <span className="font-medium text-stone-900">{profile.nutricionista}</span> &nbsp;·&nbsp; {profile.crn} &nbsp;·&nbsp; {profile.local}
            </div>
          </div>
        </div>

        <footer className="pt-1.5 hairline-t flex justify-between items-center text-[7pt] text-stone-400 mt-2">
          <span>
            {profile.nutricionista} · {profile.crn} · Plano Alimentar Personalizado
          </span>
          <span>Página 2 de 2</span>
        </footer>
      </section>
    </main>
  );
}
