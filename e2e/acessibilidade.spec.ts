import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PATIENTS, portalTokens } from "./helpers";

const ROTAS = [
  "/", "/pacientes", `/pacientes/${PATIENTS.ana.id}`, "/planos", `/planos/${PATIENTS.ana.id}`,
  "/consulta/cons-1", "/consultas", "/avaliacoes", "/alimentos", "/financeiro", "/configuracoes",
];

test.describe("acessibilidade (axe): nenhuma violação crítica, séria ou moderada", () => {
  for (const rota of ROTAS) {
    test(rota, async ({ page }) => {
      await page.goto(rota);
      await expect(page.locator("h1")).toBeVisible();
      await page.waitForTimeout(500);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const graves = violations.filter((v) => ["critical", "serious", "moderate"].includes(v.impact ?? ""));
      expect(graves.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }

  test("portal e relatório do paciente", async ({ page }) => {
    const t = await portalTokens(page);
    for (const rota of [`/portal/${t[PATIENTS.ana.id]}`, `/relatorio/${t[PATIENTS.ana.id]}`]) {
      await page.goto(rota);
      await page.waitForTimeout(600);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => ["critical", "serious", "moderate"].includes(v.impact ?? "")).map((v) => v.id)).toEqual([]);
    }
  });

  test("cada página tem <title> e <h1> próprios", async ({ page }) => {
    const titulos = new Set<string>();
    for (const rota of ["/", "/pacientes", "/financeiro", "/alimentos", "/configuracoes"]) {
      await page.goto(rota);
      titulos.add(await page.title());
      await expect(page.locator("h1")).toHaveCount(1);
    }
    expect(titulos.size).toBe(5);
  });
});
