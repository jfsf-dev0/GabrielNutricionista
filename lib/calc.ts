/**
 * Motor de Cálculos Metabólicos e Antropométricos
 * Em conformidade com as diretrizes da Sociedade Brasileira de Nutrição Esportiva (SBNE)
 * e especificações do Discovery (Módulos M3 & M4).
 */

export interface TMBParams {
  pesoKg: number;
  alturaCm: number;
  idadeAnos: number;
  genero: "M" | "F";
  massaMagraKg?: number;
}

export type ActivityLevel = "sedentario" | "leve" | "moderado" | "intenso" | "atleta";

export const ACTIVITY_FACTORS: Record<ActivityLevel, { label: string; factor: number; desc: string }> = {
  sedentario: { label: "Sedentário", factor: 1.2, desc: "Pouco ou nenhum exercício diário" },
  leve: { label: "Levemente Ativo", factor: 1.375, desc: "Exercício leve 1 a 3 dias/semana" },
  moderado: { label: "Moderadamente Ativo", factor: 1.55, desc: "Exercício moderado 3 a 5 dias/semana" },
  intenso: { label: "Altamente Ativo", factor: 1.725, desc: "Exercício pesado 6 a 7 dias/semana" },
  atleta: { label: "Extremamente Ativo / Atleta", factor: 1.9, desc: "Treinos 2x ao dia ou trabalho braçal intenso" },
};

/**
 * Fórmula de Mifflin-St Jeor (Padrão Ouro para indivíduos eutróficos e sobrepeso)
 */
export function calcMifflinStJeor(params: TMBParams): number {
  const { pesoKg, alturaCm, idadeAnos, genero } = params;
  if (genero === "M") {
    return Math.round(10 * pesoKg + 6.25 * alturaCm - 5 * idadeAnos + 5);
  } else {
    return Math.round(10 * pesoKg + 6.25 * alturaCm - 5 * idadeAnos - 161);
  }
}

/**
 * Fórmula de Harris-Benedict (Revisão Roza & Shizgal 1984)
 */
export function calcHarrisBenedict(params: TMBParams): number {
  const { pesoKg, alturaCm, idadeAnos, genero } = params;
  if (genero === "M") {
    return Math.round(88.362 + 13.397 * pesoKg + 4.799 * alturaCm - 5.677 * idadeAnos);
  } else {
    return Math.round(447.593 + 9.247 * pesoKg + 3.098 * alturaCm - 4.33 * idadeAnos);
  }
}

/**
 * Fórmula de Cunningham (Recomendada para atletas com composição corporal conhecida)
 * TMB = 500 + (22 * Massa Livre de Gordura em kg)
 */
export function calcCunningham(massaMagraKg: number): number {
  return Math.round(500 + 22 * massaMagraKg);
}

/**
 * Cálculo de Gasto Energético Total (GET)
 */
export function calcGET(tmb: number, nivel: ActivityLevel): number {
  const factor = ACTIVITY_FACTORS[nivel]?.factor || 1.55;
  return Math.round(tmb * factor);
}

/**
 * Cálculo de IMC
 */
export function calcIMC(pesoKg: number, alturaCm: number): { imc: number; classificacao: string } {
  const alturaM = alturaCm / 100;
  const imc = Number((pesoKg / (alturaM * alturaM)).toFixed(1));
  let classificacao = "Eutrofia (Peso Normal)";
  if (imc < 18.5) classificacao = "Baixo Peso";
  else if (imc >= 25 && imc < 29.9) classificacao = "Sobrepeso";
  else if (imc >= 30 && imc < 34.9) classificacao = "Obesidade Grau I";
  else if (imc >= 35 && imc < 39.9) classificacao = "Obesidade Grau II";
  else if (imc >= 40) classificacao = "Obesidade Grau III";
  return { imc, classificacao };
}

/**
 * Jackson & Pollock 3 Dobras
 * Homens: Peitoral, Abdômen, Coxa
 * Mulheres: Tríceps, Supra-ilíaca, Coxa
 */
export function calcJacksonPollock3(
  genero: "M" | "F",
  idade: number,
  dobras: { d1: number; d2: number; d3: number }
): number {
  const soma = dobras.d1 + dobras.d2 + dobras.d3;
  let densidade = 1.0;

  if (genero === "M") {
    densidade = 1.10938 - 0.0008267 * soma + 0.0000016 * soma * soma - 0.0002574 * idade;
  } else {
    densidade = 1.0994921 - 0.0009929 * soma + 0.0000023 * soma * soma - 0.0001392 * idade;
  }

  // Equação de Siri para conversão de densidade em % de gordura
  const percGordura = (495 / densidade) - 450;
  return Number(Math.max(3, Math.min(60, percGordura)).toFixed(1));
}

/**
 * Composição Corporal Completa
 */
export function calcBodyComposition(pesoKg: number, percGordura: number) {
  const massaGordaKg = Number(((pesoKg * percGordura) / 100).toFixed(1));
  const massaMagraKg = Number((pesoKg - massaGordaKg).toFixed(1));
  return { massaGordaKg, massaMagraKg };
}

/**
 * Planejador de Metas de Macronutrientes por g/kg e % calórico
 */
export function planMacros({
  pesoKg,
  caloriasAlvo,
  protGPorKg = 2.2,
  gordGPorKg = 1.0,
}: {
  pesoKg: number;
  caloriasAlvo: number;
  protGPorKg?: number;
  gordGPorKg?: number;
}) {
  const protG = Math.round(pesoKg * protGPorKg);
  const gordG = Math.round(pesoKg * gordGPorKg);
  const protKcal = protG * 4;
  const gordKcal = gordG * 9;
  const carboKcal = Math.max(0, caloriasAlvo - (protKcal + gordKcal));
  const carboG = Math.round(carboKcal / 4);
  const carboGPorKg = Number((carboG / pesoKg).toFixed(1));

  const totalKcal = protKcal + gordKcal + carboKcal;
  const protPct = Math.round((protKcal / totalKcal) * 100);
  const gordPct = Math.round((gordKcal / totalKcal) * 100);
  const carboPct = Math.round((carboKcal / totalKcal) * 100);

  return {
    calorias: caloriasAlvo,
    protG,
    protGPorKg,
    protPct,
    gordG,
    gordGPorKg,
    gordPct,
    carboG,
    carboGPorKg,
    carboPct,
    fibrasG: Math.round((caloriasAlvo / 1000) * 14), // Recomendação DRI: 14g / 1000 kcal
    aguaLitros: Number(((pesoKg * 35) / 1000).toFixed(1)), // Recomendação base: 35ml/kg
  };
}
