import { expect, test } from "@playwright/test";

test.describe("cabeçalhos de segurança e indexação", () => {
  test("respostas trazem CSP, anti-clickjacking, nosniff, referrer e permissions policy", async ({ request }) => {
    const h = (await request.get("/")).headers();
    for (const k of ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy", "x-robots-tag"]) {
      expect(h[k], k).toBeTruthy();
    }
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("robots.txt bloqueia tudo e as páginas pedem noindex", async ({ page, request }) => {
    expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \//);
    await page.goto("/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("a CSP não bloqueia nada do app (sem erros de console em várias rotas)", async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(e.message));
    for (const r of ["/", "/pacientes", "/planos/pac-ana-lima", "/alimentos", "/financeiro", "/configuracoes"]) {
      await page.goto(r);
      await page.waitForTimeout(400);
    }
    expect(erros).toEqual([]);
  });
});

test.describe("configurações e financeiro dizem a verdade", () => {
  test("Configurações salva de verdade e persiste após recarregar", async ({ page }) => {
    await page.goto("/configuracoes");
    await page.getByLabel(/Chave PIX/).fill("clinica@exemplo.com");
    await page.getByLabel(/Cidade/).fill("Campinas - SP");
    await page.getByRole("button", { name: /Salvar Alterações/ }).first().click();
    await expect(page.getByText(/Salvo com Sucesso/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(/Chave PIX/)).toHaveValue("clinica@exemplo.com");
    await expect(page.getByLabel(/Cidade/)).toHaveValue("Campinas - SP");
  });

  test("copiar chave PIX: sem chave avisa; com chave copia de fato", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/financeiro");
    await page.getByRole("button", { name: /Copiar Chave PIX/ }).click();
    await expect(page.getByText(/Cadastre a chave PIX em Configurações/)).toBeVisible();

    await page.goto("/configuracoes");
    await page.getByLabel(/Chave PIX/).fill("pix-de-teste-123");
    await page.getByRole("button", { name: /Salvar Alterações/ }).first().click();
    await page.goto("/financeiro");
    await page.getByRole("button", { name: /Copiar Chave PIX/ }).click();
    await expect(page.getByText(/Chave PIX copiada/)).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pix-de-teste-123");
  });
});
