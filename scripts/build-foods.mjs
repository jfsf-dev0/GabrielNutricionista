// Converte os CSVs da TACO em public/foods.json (valores por 100 g).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

const read = (f) => parseCsv(readFileSync(join(root, "data/taco", f), "utf8"));
const categories = new Map(read("categories.csv").map((c) => [c.id, c.name]));
const nutrients = new Map(read("nutrients.csv").map((n) => [n.foodId, n]));

// chave do app -> coluna da TACO
const MAP = {
  kcal: "kcal", p: "protein", c: "carbohydrates", l: "lipids", fibras: "dietaryFiber",
  colesterol: "cholesterol", calcio: "calcium", magnesio: "magnesium", fosforo: "phosphorus",
  ferro: "iron", sodio: "sodium", potassio: "potassium", zinco: "zinc", cobre: "copper",
  vitC: "vitaminC", tiamina: "thiamin", riboflavina: "riboflavin", piridoxina: "pyridoxine",
  niacina: "niacin", retinol: "retinol",
};

const foods = [];
for (const f of read("food.csv")) {
  const raw = nutrients.get(f.id);
  if (!raw) continue;
  const n = {};
  for (const [key, col] of Object.entries(MAP)) {
    const v = raw[col];
    if (v === undefined || v === "" || Number.isNaN(Number(v))) continue;
    n[key] = Number(v);
  }
  if (n.kcal === undefined) continue; // sem energia não dá para calcular o plano
  foods.push({ id: Number(f.id), nome: f.name, grupo: categories.get(f.categoryId) ?? "Outros", origem: "TACO", n });
}

// --- Medidas caseiras (por alimento da TACO) ---
const byId = new Map(foods.map((f) => [f.id, f]));
const medidas = JSON.parse(readFileSync(join(root, "data/extra/medidas.json"), "utf8"));
for (const m of medidas) {
  const food = byId.get(m.id);
  if (!food) throw new Error(`medidas.json: alimento #${m.id} (${m.nome}) não existe na TACO gerada`);
  if (food.nome !== m.nome) throw new Error(`medidas.json: #${m.id} é "${food.nome}", esperado "${m.nome}"`);
  food.medidas = m.medidas;
}

// --- Produtos sem equivalente na TACO (ids a partir de 1001, estáveis pela ordem do arquivo) ---
const produtos = JSON.parse(readFileSync(join(root, "data/extra/produtos.json"), "utf8"));
produtos.forEach((p, i) => foods.push({ id: 1001 + i, nome: p.nome, grupo: p.grupo, origem: p.origem, n: p.n, medidas: p.medidas }));

const ids = new Set();
for (const f of foods) {
  if (ids.has(f.id)) throw new Error(`id duplicado: ${f.id}`);
  ids.add(f.id);
}

writeFileSync(join(root, "public/foods.json"), JSON.stringify(foods));
console.log(`${foods.length} alimentos (${medidas.length} com medidas caseiras, ${produtos.length} produtos internos) → public/foods.json`);
