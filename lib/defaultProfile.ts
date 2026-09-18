import { migrateProfile } from "./migrate";
import type { PatientProfile } from "./types";

/** Ficha original (formato v1), preservada como dado de referência. */
const legacyModelo = {
  id: "modelo-joao-freire",
  paciente: "João Freire",
  data: "24 de Setembro de 2025",
  fase: "Manutenção Calórica",
  nutricionista: "Dr. Gabriel Alves da Silva",
  crn: "CRN-3: 81965/P",
  telefone: "(11) 97016-1953",
  local: "Jardim São Paulo, SP",
  calorias: 2268,
  prot: 171.6,
  carbo: 234.6,
  gord: 76.0,
  fibras: 33.6,
  agua: "3,0L a 3,8L / dia",
  suplementos: [
    {
      id: "sup-1",
      nome: "Ferro Quelado (Vitafort)",
      posologia: "1 cápsula/dia (6 meses)",
      obs: "Reavaliar exames laboratoriais a cada 2 meses para acompanhamento sérico até normalização."
    },
    {
      id: "sup-2",
      nome: "Creatina Monohidratada",
      posologia: "3 g/dia contínuos",
      obs: "Saturação opcional (22g/dia por 7d em 3 tomadas de 7g; após 3g/dia). O uso contínuo de 3g atinge a mesma saturação."
    },
    {
      id: "sup-3",
      nome: "Ômega 3 (EPA / DHA)",
      posologia: "2 cápsulas pós 1ª ref. (3x/sem)",
      obs: "Aporte de ácidos graxos essenciais e suporte à modulação inflamatória e cardiovascular."
    },
    {
      id: "sup-4",
      nome: "Pré-Treino Estratégico",
      posologia: "1 dose pré-esforço",
      obs: "Utilizar pontualmente apenas em dias de fadiga intensa ou treinos com sobrecarga superior."
    },
    {
      id: "sup-5",
      nome: "Regra de Vegetais Livres",
      posologia: "Mix à vontade (mín. 100g)",
      obs: "Atenção: não incluir batatas, mandioca e abóboras no mix livre (pois são carboidratos medidos)."
    }
  ],
  meals: {
    1: {
      id: 1,
      nome: "01. Café da Manhã",
      horario: "07:00 – 08:30",
      optA: {
        titulo: "Opção A — Bowl de Iogurte, Frutas & Nuts",
        cal: 479,
        p: 27.4,
        c: 56.1,
        l: 17.9,
        itens: [
          "Iogurte proteico desnatado (Parmalat Fit ou similar) | 120 g",
          "Whey protein concentrado (misturado no iogurte) | 10 g (1 col. sopa)",
          "Castanha-de-caju ou mix de nuts | 30 g",
          "Aveia em flocos | 25 g",
          "Morangos frescos [Subst: Uva 50g ou Kiwi 75g] | 80 g",
          "Banana nanica [Subst: Maçã 80g ou Manga 100g] | 75 g (1 un. peq.)"
        ]
      },
      optB: {
        titulo: "Opção B — Toast Integral com Ovos & Requeijão",
        cal: 523,
        p: 26.5,
        c: 54.3,
        l: 24.3,
        itens: [
          "Pão de forma integral (2 fatias) | 50 g",
          "Requeijão cremoso tradicional | 20 g",
          "Ovos de galinha inteiros (mexidos ou cozidos) | 100 g (2 un.)",
          "Bebida vegetal ou de soja com café | 165 ml",
          "Mix de frutas: Uvas (80g) + Morangos frescos (80g) | 160 g total",
          "Granola tradicional crocante | 20 g (2 col. sopa)",
          "*Se fruta única: 100g uva (ou 1 banana peq.) OU 150g morango."
        ]
      }
    },
    2: {
      id: 2,
      nome: "02. Almoço",
      horario: "12:30 – 13:30",
      optA: {
        titulo: "Opção A — Frango Refogado Especial com Batata Assada",
        cal: 611,
        p: 52.4,
        c: 70.2,
        l: 14.7,
        itens: [
          "Peito de frango refogado com especiarias | 140 g (pronto)",
          "↳ Refogado c/ gergelim, cebola, pimentão, brócolis, shoyu, curry e páprica.",
          "↳ Subst: Carne bovina magra (patinho/maminha) — 110g",
          "Batata inglesa assada com alecrim e azeite | 180 g",
          "↳ Subst: Abóbora cabotiá cozida (90g) OU Batata-doce (42g)",
          "Arroz branco cozido | 80 g",
          "Mix de legumes refogados no azeite | À vontade",
          "Fruta digestiva: Laranja, tangerina ou abacaxi | 90 g (1 un. peq.)"
        ]
      },
      optB: {
        titulo: "Opção B — Pescado Branco Grelhado com Arroz e Feijão",
        cal: 605,
        p: 52.6,
        c: 70.3,
        l: 13.1,
        itens: [
          "Tilápia / Merluza / St. Peter grelhado ou assado | 150 g",
          "↳ Subst: Peito de frango grelhado — 150g",
          "Feijão preto ou carioca cozido (1 concha) | 140 g",
          "↳ Subst: Grão-de-bico cozido (140g) OU Lentilha (140g)",
          "Arroz branco ou integral cozido | 100 g",
          "Mix de legumes (vapor ou refogado) | À vontade (mín. 100g)",
          "Azeite de oliva extravirgem | 5 g (1 col. sobremesa)",
          "Fruta digestiva: Laranja, tangerina ou abacaxi | 90 g"
        ]
      }
    },
    3: {
      id: 3,
      nome: "03. Lanche da Tarde",
      horario: "16:30 – 17:30",
      optA: {
        titulo: "Opção A — Smoothie Proteico & Torradas",
        cal: 519,
        p: 37.5,
        c: 55.7,
        l: 17.6,
        itens: [
          "Whey protein concentrado (1 dose padrão) | 40 g",
          "Leite de amêndoas ou bebida vegetal | 150 ml",
          "Banana nanica ou morangos congelados | 100 g (1 un.)",
          "Aveia em flocos finos | 15 g (1 col. sopa)",
          "Torradas integrais (3 un.) | 22,5 g",
          "Requeijão tradicional cremoso | 30 g",
          "*Preparo: bater a bebida vegetal, whey, banana e aveia em smoothie."
        ]
      },
      optB: {
        titulo: "Opção B — Wrap com Carne Magra & Amendoim",
        cal: 569,
        p: 40.9,
        c: 49.5,
        l: 24.2,
        itens: [
          "Massa de wrap (Rap10) [Subst: Pão francês 50g] | 40 g (1 un.)",
          "Carne moída magra (patinho) [Subst: Atum em água 80g] | 80 g",
          "Queijo muçarela fatiado | 15 g",
          "Alface americana e tomate fresco | À vontade",
          "Banana nanica [Subst: Maçã 130g] | 100 g",
          "Pasta de amendoim (Dr. Peanut Avelã ou similar) | 25 g",
          "*Dica: espalhar carne crua na massa e selar na frigideira com o queijo."
        ]
      }
    },
    4: {
      id: 4,
      nome: "04. Jantar",
      horario: "20:30 – 21:30",
      optA: {
        titulo: "Opção A — Frango com Batatas ao Alecrim",
        cal: 571,
        p: 51.6,
        c: 60.4,
        l: 14.4,
        itens: [
          "Peito de frango refogado com especiarias | 140 g",
          "↳ Subst: Carne bovina magra (filé ou moída) — 110g",
          "Batata inglesa assada com alecrim e azeite | 180 g",
          "↳ Subst: Abóbora cabotiá (90g) OU Batata-doce (42g)",
          "Arroz branco cozido | 80 g",
          "Mix de legumes refogados no azeite | À vontade"
        ]
      },
      optB: {
        titulo: "Opção B — Pescado Branco com Arroz & Feijão",
        cal: 565,
        p: 51.8,
        c: 60.6,
        l: 12.9,
        itens: [
          "Tilápia / Peixe branco grelhado [Subst: Frango 150g] | 150 g",
          "Feijão preto ou carioca [Subst: Grão-de-bico 140g] | 140 g",
          "Arroz branco ou integral cozido | 100 g",
          "Azeite de oliva extravirgem | 5 g (1 col. sobremesa)",
          "Mix de legumes no vapor ou refogados | À vontade"
        ]
      }
    }
  },
  receita: {
    nome: "Wrap Funcional de Aveia",
    rendimento: "1 porção individual · 5 minutos",
    ingredientes: "30g iogurte natural tradicional + 30g farelo de aveia fino + 30ml leite integral UHT + 1 pitada de sal (0,4g)",
    preparo: "Misturar todos os ingredientes em um bowl até obter massa cremosa. Verter sobre frigideira antiaderente pré-aquecida em fogo baixo. Dourar por 2 minutos de cada lado e rechear."
  },
  lipideosStr: "<b>Ácidos Graxos & Fibras:</b> Monoinsat: 21,6g · Poli-insat: 8,2g · Saturados: 21,7g · Trans: 0,4g · Colesterol: 604,8mg · <b>Fibras: 33,6g</b>",
  mineraisStr: "<b>Minerais:</b> Sódio: 1.479,6mg · Potássio: 3.076,3mg · Fósforo: 1.284,8mg · Cálcio: 399,7mg · Magnésio: 213,5mg · <b>Ferro: 11,0mg</b> · Zinco: 11,6mg · Selênio: 43,9mcg",
  vitaminasStr: "<b>Vitaminas:</b> Vit. C: 169,7mg · Niacina (B3): 38,3mg · Folato (B9): 256,6mcg · Vit. B12: 4,6mcg · Vit. A: 164,8mcg · Vit. D: 1,9mcg · Vit. E: 5,5mg · B1: 1,0mg · B6: 1,1mg · B2: 0,7mg"
};

export const defaultProfile: PatientProfile = migrateProfile(legacyModelo);
