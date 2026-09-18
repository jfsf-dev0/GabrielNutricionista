# GabrielNutricionista — Plataforma Clínica & Prescrição Dietética de Alta Performance

Plataforma desenvolvida integralmente com base nas especificações de produto do **Discovery** (`discovery.pdf`) para o **Dr. Gabriel Alves da Silva** (CRN-3: 81965/P).

A aplicação segue a mesma arquitetura, rigor técnico e design minimalista e estético do **Gestão MetricLab** (Next.js 15 App Router, TypeScript, Tailwind CSS v4, Lucide Icons, e deploy contínuo na Vercel).

🔗 **Deploy em Produção:** [https://gabriel-nutricionista.vercel.app](https://gabriel-nutricionista.vercel.app)

---

## 📐 Telas Implementadas (Wireframes W1 a W5)

| Tela | Rota | Descrição |
| :--- | :--- | :--- |
| **W1 — Início (Dashboard Geral)** | `/` | KPIs clínicos (Consultas hoje, Pacientes ativos, Aderência 7d, Faturamento), Agenda do dia com acionamento direto do Modo Consulta, Central de Alertas de Risco (M9) e feed do Diário PWA em tempo real. |
| **W2 — Ficha do Paciente** | `/pacientes/[id]` | Prontuário clínico com 7 abas especializadas: *Resumo*, *Prontuário & Anamnese*, *Avaliações Físicas*, *Plano Alimentar Ativo*, *Diário & Aderência*, *Exames Laboratoriais* e *Financeiro*. |
| **W3 — Construtor de Planos** | `/planos/[id]` | Split-view em tempo real: Construtor de refeições com suporte a **Opção A / Opção B**, **Busca instantânea no Banco TACO** com seleção de medidas caseiras e cálculo automático, integrado ao **Dossiê Editorial A4 de 2 Páginas (9pt)** pronto para impressão/PDF. |
| **W4 — Modo Consulta** | `/consulta/[id]` | Interface focada para atendimento ao vivo (presencial ou teleconsulta), cronômetro clínico, aferição física rápida (peso, dobras, circunferências com recálculo instantâneo de IMC e variação), queixa atual e atualização de prontuário. |
| **W5 — App do Paciente (PWA)** | `/portal/[token]` | Visão mobile-first do paciente no smartphone/tablet: Saudação personalizada, **Tracker interativo de água** (+250ml / +500ml), **Checklist de refeições** com alternância de Opção A/B, suplementação do dia e acesso ao download do PDF de 2 páginas. |

---

## 🔬 Módulos & Motores Clínicos

- **M1 — Multi-tenant & Perfil do Nutricionista (`/configuracoes`):** Identidade profissional do Dr. Gabriel Alves, número CRN, clínica e diretrizes de emissão técnica CFN.
- **M2 — Gestão de Pacientes (`/pacientes`):** Diretório completo com filtros por objetivo (Hipertrofia, Emagrecimento, Performance, Longevidade), status de atenção e cadastro ágil.
- **M3 & M4 — Cálculos Antropométricos e Metabólicos (`/avaliacoes` & `lib/calc.ts`):**
  - Fórmulas de TMB: **Mifflin-St Jeor**, **Harris-Benedict (1984)** e **Cunningham (Massa Livre de Gordura)**.
  - Gasto Energético Total (GET) por Fator de Atividade (1.2 a 1.9x).
  - Dobras Cutâneas de **Jackson & Pollock (3 e 7 dobras)** com equação de Siri para cálculo de % de Gordura Corporal, Massa Magra (kg) e Massa Gorda (kg).
  - Planejamento de Macronutrientes por g/kg e % calórica (Proteínas, Carboidratos, Lipídeos, Fibras e Hidratação).
- **M5 — Banco de Alimentos (`/alimentos`, `lib/foods.ts`, `public/foods.json`):**
  - 602 alimentos: TACO 4ª ed. (NEPA/UNICAMP, 591) + 11 produtos do cadastro interno (whey, creatina, tilápia, cottage…), com medidas caseiras (colheres, fatias, scoops…) e simulador de porções. Base gerada por `npm run build:foods` a partir de `data/taco` e `data/extra`.
  - Busca com tolerância a erro de digitação; preparado antes de cru; alimentos que violam restrições do paciente aparecem sinalizados (alerta baseado em grupo/nome, não garantia).
  - Nutriente ausente na tabela de origem é mostrado como “—”; no relatório, somas incompletas levam `*` e uma nota.
- **M6 & M7 — Prescrição & Dossiê Editorial A4 (`lib/defaultProfile.ts` & `components/ReportPreview.tsx`):**
  - Layout milimetricamente calibrado em `@media print`: proporção A4 estrita (210 × 297 mm), exatamente **2 páginas** (frente e verso), tipografia de 9pt, títulos em serif (`Newsreader`) e sem sobras/cortes indesejados.
- **M8 & M9 — Diário Alimentar, Aderência & Alertas Clínicos:**
  - Sincronização de registros de refeições, ingestão hídrica e monitoramento de quedas de adesão (< 70%) ou pacientes inativos por 5+ dias.
- **M10 & M11 — Agenda de Consultas & Financeiro (`/consultas` e `/financeiro`):**
  - Agendamentos presenciais e teleconsultas, controle de mensalidades e geração de chave PIX da clínica.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Tipografia:** Inter (Sans-serif técnica) & Newsreader (Serif editorial clássica)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Testes:** [Vitest](https://vitest.dev/) (lógica pura, base real de alimentos) e [Playwright](https://playwright.dev/) + axe (E2E, acessibilidade, impressão, segurança)
- **Qualidade:** ESLint sem avisos, `tsc`, GitHub Actions (`.github/workflows/ci.yml`)
- **Hospedagem:** [Vercel](https://vercel.com/)

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Qualidade
npm run lint         # ESLint, 0 avisos
npm run typecheck    # tsc
npm test             # Vitest (lógica pura e base real de alimentos)

# 4. Produção
npm run build

# 5. E2E (constrói e sobe o app; precisa de Chromium)
npx playwright install chromium
npm run e2e          # PW_CHROMIUM=/caminho/do/chromium para usar um navegador já instalado

# 6. Regenerar a base de alimentos
npm run build:foods
```

---

## ⚠️ Modo demonstração (limites atuais)

- **Todos os dados ficam no `localStorage` do navegador**: não há backend, login nem backup. Não use dados reais de pacientes até o backend ser ativado; use “Exportar JSON” como cópia.
- **Portal do paciente** (`/portal/{token}`): o token é secreto (128 bits) e o id do paciente não vale como link, mas como os dados só existem no navegador do profissional, o link só funciona nesse navegador. Autenticação real depende do backend.
- O site é `noindex` e envia CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy` e `Permissions-Policy`.
- A CSP mantém `'unsafe-inline'` em scripts (o Next injeta scripts de hidratação); remover exige nonce por requisição via middleware.

---

## 🔒 Confidencialidade

Projeto desenvolvido sob medida para **Gabriel Alves · Nutrição Clínica & Alta Performance**.
