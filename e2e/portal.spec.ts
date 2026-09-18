import { expect, test } from "@playwright/test";
import { PATIENTS, portalTokens } from "./helpers";

test.describe("portal e relatório do paciente", () => {
  test("token válido abre o paciente; id, token curto e inexistente são bloqueados", async ({ page }) => {
    const t = await portalTokens(page);
    const tok = t[PATIENTS.ana.id];
    expect(tok.length).toBeGreaterThanOrEqual(24);
    expect(tok).not.toBe(PATIENTS.ana.id);

    await page.goto(`/portal/${tok}`);
    await expect(page.getByText(/Olá, Ana/i)).toBeVisible();

    for (const bad of [PATIENTS.ana.id, "abc", "token-inexistente-xyz-123456"]) {
      await page.goto(`/portal/${bad}`);
      await expect(page.getByRole("heading", { name: /Link inválido/ })).toBeVisible();
      await expect(page.locator("body")).not.toContainText(/Ana|kcal/);
    }
  });

  test("relatório A4 do paciente só abre com o token", async ({ page }) => {
    const t = await portalTokens(page);
    await page.goto(`/relatorio/${t[PATIENTS.ana.id]}`);
    await expect(page.getByText("Planejamento Alimentar Individualizado")).toBeVisible();
    await page.goto(`/relatorio/${PATIENTS.ana.id}`);
    await expect(page.getByRole("heading", { name: /Link inválido/ })).toBeVisible();
  });

  test("links do portal no dashboard usam token, nunca o id do paciente", async ({ page }) => {
    await page.goto("/");
    // o link começa como "#" e vira /portal/{token} depois que o token é carregado
    await expect(page.locator('a[href^="/portal/"]').first()).toHaveAttribute("href", /^\/portal\/[0-9a-f]{32}$/);
    const hrefs = await page.locator('a[href^="/portal/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).toMatch(/^\/portal\/[0-9a-f]{32}$/);
  });

  test("portal não marca refeições que ninguém fez e o botão de PDF leva ao relatório do paciente", async ({ page }) => {
    const t = await portalTokens(page);
    await page.goto(`/portal/${t[PATIENTS.ana.id]}`);
    await expect(page.getByText(/0 de \d+ realizadas/)).toBeVisible();
    const href = await page.locator('a[href*="/relatorio/"]').first().getAttribute("href");
    expect(href).toContain(`/relatorio/${t[PATIENTS.ana.id]}`);
    expect(href).not.toContain("/planos/");
  });
});
