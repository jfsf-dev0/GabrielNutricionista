# Dados complementares

- `medidas.json`: medidas caseiras por alimento da TACO (`id` + `nome` são conferidos contra o CSV na geração).
- `produtos.json`: alimentos/produtos sem equivalente na TACO (suplementos e itens de cadastro interno).
  Valores por 100 g, origem "Cadastro interno". Conferir com o rótulo do produto real antes de prescrever.

Migrados de `lib/taco.ts` (base paralela aposentada). Regenerar `public/foods.json` com `npm run build:foods`.
