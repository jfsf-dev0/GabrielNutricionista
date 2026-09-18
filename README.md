# GabrielNutricionista — Painel de Prescrição Nutricional & Dossiê Editorial

Sistema clínico de alta precisão e design editorial desenvolvido para o **Dr. Gabriel Alves da Silva** (CRN-3: 81965/P).

Inspirado na arquitetura e rigor de engenharia do ecossistema **MetricLab**, o projeto permite estruturar prescrições dietéticas, metas energéticas, protocolos de suplementação, refeições personalizadas e matrizes de micronutrientes com geração instantânea de relatórios em **formato editorial A4 de exatamente 2 páginas (frente e verso) com tipografia de 9pt**.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Deploy:** [Vercel](https://vercel.com/)

---

## 🧭 Fluxo de geração do plano

Passo a passo guiado, com o painel **Meta × Planejado** fixo em todos os passos:

1. **Paciente** — identificação e restrições (lactose, glúten, ovo, vegano… + termos livres).
2. **Metas** — calculadora (Mifflin-St Jeor) como ponto de partida; o profissional ajusta.
3. **Refeições** — quantas refeições e opções quiser. Os alimentos vêm da base **TACO** (591 itens) por busca com autocomplete tolerante a erro de digitação. kcal, macros e micronutrientes são **calculados**, nunca digitados. Cada item tem troca sugerida (mesmo grupo e preparo, mesmas kcal) e o botão **Completar** sugere itens que aproximam a opção da meta. Alimentos que conflitam com as restrições aparecem sinalizados.
4. **Suplementos e receita** — micronutrientes do relatório somados dos alimentos (ou texto manual).
5. **Revisão** — conferência (desvio da meta, refeição vazia, restrições, itens sem vínculo), salvar e imprimir.

Pacientes ficam salvos no navegador (`localStorage`), com rascunho automático. Exportar/importar JSON continua disponível e aceita o formato antigo (migração automática).

As recomendações são determinísticas e explicáveis (nenhuma usa IA) e as checagens de restrição são alertas baseados em grupo/nome do alimento: o nutricionista confirma.

## 📐 Estrutura do Projeto

```
├── app/                      # layout, page (FoodsProvider + App)
├── components/
│   ├── App.tsx               # estado, rascunho, salvar, favoritos
│   ├── Editor.tsx            # stepper de 5 passos
│   ├── steps/                # Identificacao, Metas, Refeicoes, Extras, Revisao
│   ├── GoalPanel.tsx         # meta × planejado
│   ├── FoodPicker.tsx        # busca de alimentos
│   └── ReportPreview.tsx     # relatório A4 de 2 páginas (9pt)
├── lib/
│   ├── types.ts              # modelo v2 (itens estruturados)
│   ├── nutrition.ts          # cálculo, metas, saldo
│   ├── foods.ts              # busca e restrições
│   ├── recommend.ts          # substituições e completar
│   ├── validate.ts           # conferência do plano
│   ├── migrate.ts            # perfil legado → v2
│   └── storage.ts            # pacientes, rascunho, favoritos
├── data/taco/                # CSVs de origem (TACO 4ª ed., NEPA/UNICAMP)
├── scripts/build-foods.mjs   # gera public/foods.json
└── tests/                    # Vitest (lógica pura)
```

## 🚀 Como Executar Localmente

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

3. **Verificação de Tipos e Build de Produção:**
   ```bash
   npm test
   npm run typecheck
   npm run build
   npm run build:foods   # regenera public/foods.json a partir de data/taco
   ```

---

## 📄 Formato de Impressão / PDF

O sistema possui regras `@media print` milimetricamente calibradas. Ao pressionar `Cmd + P` ou clicar no botão **Imprimir / Exportar PDF**:
- Toda a barra de navegação e o painel de edição são ocultados automaticamente.
- A folha é renderizada em proporção estrita A4 (210 × 297 mm).
- O relatório gera exatamente **2 páginas**, sem sobras ou cortes de página indesejados.

---

## 🔒 Licença

Projeto confidencial e exclusivo desenvolvido para Gabriel Alves Nutrição & Treinamento.
