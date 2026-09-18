import { violations } from "./foods";
import { dayTotals, goalBalance, optionTotals, type FoodIndex } from "./nutrition";
import type { PatientProfile } from "./types";

export interface Issue {
  nivel: "erro" | "aviso";
  codigo: string;
  mensagem: string;
}

const AVISO_PCT = 5;
const ERRO_PCT = 10;
const OPCOES_DIVERGENTES_PCT = 15;

export function validatePlan(profile: PatientProfile, foods: FoodIndex): Issue[] {
  const issues: Issue[] = [];
  const add = (nivel: Issue["nivel"], codigo: string, mensagem: string) => issues.push({ nivel, codigo, mensagem });

  if (!profile.paciente.trim()) add("erro", "paciente", "Informe o nome do paciente.");

  for (const m of profile.meals)
    for (const o of m.opcoes) {
      const semVinculo = o.itens.some((i) => !i.nota && i.foodId === undefined);
      const extra = o.extra.kcal || o.extra.p || o.extra.c || o.extra.l;
      if (semVinculo && !extra) {
        add("aviso", "sem-vinculo", `“${m.nome} · ${o.titulo}” tem itens sem vínculo com a base que não entram no cálculo.`);
      }
    }

  const preenchidas = profile.meals.filter((m) => m.opcoes.some((o) => !optionTotals(o, foods).vazia));
  if (preenchidas.length === 0) {
    add("erro", "sem-refeicoes", "Nenhuma refeição tem alimentos. Adicione ao menos uma.");
    return issues;
  }

  for (const m of profile.meals) {
    if (!m.opcoes.some((o) => !optionTotals(o, foods).vazia)) {
      add("aviso", "refeicao-vazia", `“${m.nome}” não tem nenhuma opção preenchida.`);
    }
  }

  const bal = goalBalance(profile, dayTotals(profile, foods).media);
  const rotulos = { kcal: "calorias", p: "proteínas", c: "carboidratos", l: "lipídios" } as const;
  for (const k of ["kcal", "p", "c", "l"] as const) {
    const b = bal[k];
    if (b.meta <= 0) continue;
    const abs = Math.abs(b.desvioPct);
    if (abs < AVISO_PCT) continue;
    const sentido = b.desvioPct > 0 ? "acima" : "abaixo";
    const nivel = abs >= ERRO_PCT ? "erro" : "aviso";
    add(nivel, `desvio-${k}`, `Planejado de ${rotulos[k]} está ${abs.toFixed(0)}% ${sentido} da meta.`);
  }

  const totals = dayTotals(profile, foods);
  const semFibras = totals.semDado.fibras ?? 0;
  if (semFibras > 0) {
    add("aviso", "dados-incompletos", `Fibras somadas parcialmente: ${semFibras} alimento(s) do plano não têm esse dado na tabela de origem.`);
  }

  for (const m of profile.meals) {
    const kcals = m.opcoes.map((o) => optionTotals(o, foods)).filter((t) => !t.vazia).map((t) => t.macros.kcal);
    if (kcals.length < 2) continue;
    const min = Math.min(...kcals), max = Math.max(...kcals);
    const pct = max > 0 ? ((max - min) / max) * 100 : 0;
    if (pct > OPCOES_DIVERGENTES_PCT) {
      add("aviso", "opcoes-divergentes", `As opções de “${m.nome}” diferem ${pct.toFixed(0)}% em calorias (${min.toFixed(0)}–${max.toFixed(0)} kcal): o paciente pode ficar muito acima ou abaixo da meta conforme a escolha.`);
    }
  }

  const conflitos = new Set<string>();
  for (const m of profile.meals)
    for (const o of m.opcoes)
      for (const it of o.itens) {
        const f = it.foodId !== undefined ? foods.get(it.foodId) : undefined;
        if (!f) continue;
        const v = violations(f, profile.restricoes);
        if (v.length) conflitos.add(`${f.nome} (${v.join(", ")}) em “${m.nome}”`);
      }
  for (const c of conflitos) add("aviso", "restricao", `Restrição do paciente: ${c}.`);

  return issues;
}
