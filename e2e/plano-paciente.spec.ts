import { expect, test } from "@playwright/test";
import { confirmDialog, openBuilder, PATIENTS, portalTokens } from "./helpers";

test.describe("construtor de plano ligado ao paciente", () => {
  test("abre o paciente certo por id do paciente e por id do plano", async ({ page }) => {
    await openBuilder(page, PATIENTS.ana.id);
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText(PATIENTS.ana.nome);
    await openBuilder(page, "plano-ana-lima");
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText(PATIENTS.ana.nome);
  });

  test("id inexistente mostra 'não encontrado', não outro paciente", async ({ page }) => {
    await page.goto("/planos/nao-existe");
    await expect(page.getByRole("heading", { name: "Paciente não encontrado" })).toBeVisible();
    await page.goto("/pacientes/nao-existe");
    await expect(page.getByRole("heading", { name: "Paciente não encontrado" })).toBeVisible();
    await page.goto("/consulta/nao-existe");
    await expect(page.getByRole("heading", { name: "Paciente não encontrado" })).toBeVisible();
  });

  test("restrições do cadastro entram no plano e o nome é somente leitura", async ({ page }) => {
    await openBuilder(page, PATIENTS.ana.id);
    await expect(page.getByLabel(/Lactose/)).toBeChecked();
    await expect(page.getByLabel("Nome do paciente")).toHaveAttribute("readonly", "");
  });

  test("edições salvam sozinhas, persistem e ficam isoladas por paciente", async ({ page }) => {
    await openBuilder(page, PATIENTS.ana.id);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("frango grelhado");
    await page.locator("ul.absolute li button").first().click();
    await expect(page.getByText(/Salvo às/)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toBeVisible();
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await expect(page.getByLabel(/Gramas de Frango/).first()).toBeVisible();

    await openBuilder(page, PATIENTS.carlos.id);
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText(PATIENTS.carlos.nome);
  });

  test("sair da página logo depois de editar não perde a última alteração", async ({ page }) => {
    await openBuilder(page, PATIENTS.carlos.id);
    await page.getByRole("button", { name: /Limpar plano/ }).click();
    await confirmDialog(page, /Limpar plano/);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("mandioca");
    await page.locator("ul.absolute li button").first().click();
    // navega imediatamente, antes de o salvamento automático (400 ms) disparar
    await page.goto("/pacientes");
    await openBuilder(page, PATIENTS.carlos.id);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await expect(page.getByLabel(/Gramas de Mandioca/)).toBeVisible();
  });

  test("o portal do paciente reflete o plano editado no construtor", async ({ page }) => {
    await openBuilder(page, PATIENTS.ana.id);
    await page.getByRole("button", { name: /Limpar plano/ }).click();
    await confirmDialog(page, /Limpar plano/);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("banana");
    await page.locator("ul.absolute li button").first().click();
    await expect(page.getByText(/Salvo às/)).toBeVisible();

    const tokens = await portalTokens(page);
    await page.goto(`/portal/${tokens[PATIENTS.ana.id]}`);
    await expect(page.getByText(/Olá, Ana/i)).toBeVisible();
    await expect(page.getByText(/Banana/).first()).toBeVisible();
    await expect(page.getByText(/0 de \d+ realizadas/)).toBeVisible();
  });

  test("campos de gramas não aceitam negativo nem valor absurdo", async ({ page }) => {
    await openBuilder(page, PATIENTS.carlos.id);
    await page.getByRole("button", { name: /Limpar plano/ }).click();
    await confirmDialog(page, /Limpar plano/);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("arroz cozido");
    await page.locator("ul.absolute li button").first().click();
    const g = page.getByLabel(/Gramas de Arroz/);
    await g.fill("-500");
    await expect(g).toHaveValue("0");
    await g.fill("99999");
    await expect(g).toHaveValue("5000");
  });

  test("importar JSON inválido avisa sem quebrar; JSON malformado mas legível é sanitizado", async ({ page }) => {
    await openBuilder(page, PATIENTS.carlos.id);
    const input = page.getByLabel("Importar plano em JSON");
    await input.setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{nao-json") });
    await expect(page.getByText("Arquivo JSON inválido.")).toBeVisible();

    const malformado = { versao: 2, paciente: "X", meals: [{ id: 1, nome: "Café", opcoes: [{ titulo: "A", itens: [{ nome: "algo", gramas: -50 }] }] }] };
    await input.setInputFiles({ name: "y.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(malformado)) });
    await confirmDialog(page, /Importar/);
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText("Café");
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText(PATIENTS.carlos.nome);
  });
});
