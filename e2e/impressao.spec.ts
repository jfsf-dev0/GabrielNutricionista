import { expect, test } from "@playwright/test";
import { openBuilder, PATIENTS, pdfPages, portalTokens } from "./helpers";

test.describe("impressão do plano em 2 páginas A4", () => {
  for (const [nome, p] of Object.entries(PATIENTS)) {
    test(`plano de ${nome} gera PDF de 2 páginas`, async ({ page }) => {
      await openBuilder(page, p.id);
      expect(await pdfPages(page)).toBe(2);
    });
  }

  test("relatório do paciente por token também imprime 2 páginas", async ({ page }) => {
    const t = await portalTokens(page);
    await page.goto(`/relatorio/${t[PATIENTS.ana.id]}`);
    await expect(page.getByText("Planejamento Alimentar Individualizado")).toBeVisible();
    expect(await pdfPages(page)).toBe(2);
  });
});
