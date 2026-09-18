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

## 📐 Estrutura do Projeto

```
GabrielNutricionista/
├── app/
│   ├── globals.css          # Configuração do Tailwind CSS v4 e regras de impressão A4
│   ├── layout.tsx           # Layout raiz com tipografia Newsreader (serif) e Inter (sans)
│   └── page.tsx             # Dashboard reativo com tela dividida (Split-Screen)
├── components/
│   ├── Navbar.tsx           # Barra superior com exportação JSON e acionamento de impressão
│   ├── PatientEditor.tsx    # Painel de edição segmentado por abas clínicas
│   └── ReportPreview.tsx    # Preview das 2 páginas A4 em tempo real com tipografia 9pt
├── lib/
│   ├── defaultProfile.ts    # Perfil padrão de referência (João Freire - 2.268 kcal)
│   └── types.ts             # Tipagem estrita TypeScript de todas as entidades clínicas
├── public/                  # Assets estáticos
├── next.config.mjs          # Configuração de build Next.js
├── postcss.config.mjs       # Pipeline PostCSS
├── tsconfig.json            # Configuração de TypeScript
└── package.json
```

---

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
   npm run typecheck
   npm run build
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
