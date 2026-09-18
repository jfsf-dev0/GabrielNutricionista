import { expect, test } from "@playwright/test";
import { confirmDialog, openBuilder, PATIENTS } from "./helpers";

test.describe("base de alimentos, busca e restrições", () => {
  test("busca do construtor: preparado antes do cru, corte comum, suplementos e erro de digitação", async ({ page }) => {
    await openBuilder(page, PATIENTS.carlos.id);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    const busca = page.getByPlaceholder(/Buscar alimento/).first();
    const primeiro = async (q: string) => {
      await busca.fill(q);
      return (await page.locator("ul.absolute li button").first().innerText()).split("\n")[0];
    };
    expect(await primeiro("arroz")).toMatch(/cozido/);
    expect(await primeiro("frango grelhado")).toMatch(/peito/);
    expect(await primeiro("whey")).toMatch(/Whey/);
    expect(await primeiro("aroz cozido")).toBe("Arroz, tipo 1, cozido");
  });

  test("alimento que viola restrição do paciente aparece sinalizado e a revisão avisa", async ({ page }) => {
    await openBuilder(page, PATIENTS.ana.id); // intolerância à lactose
    await page.getByRole("button", { name: /Limpar plano/ }).click();
    await confirmDialog(page, /Limpar plano/);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("queijo minas");
    await expect(page.locator("ul.absolute li button").first()).toContainText("⚠ lactose");
    await page.locator("ul.absolute li button").first().click();
    await page.getByRole("button", { name: /^5\s*Revisão/ }).click();
    await expect(page.getByText(/Restrição do paciente/)).toBeVisible();
  });

  test("medida caseira ajusta os gramas e fibras ausentes marcam a soma como parcial", async ({ page }) => {
    await openBuilder(page, PATIENTS.carlos.id);
    await page.getByRole("button", { name: /Limpar plano/ }).click();
    await confirmDialog(page, /Limpar plano/);
    await page.getByRole("button", { name: /^3\s*Refeições/ }).click();
    await page.getByPlaceholder(/Buscar alimento/).first().fill("frango grelhado");
    await page.locator("ul.absolute li button").first().click();
    await page.getByLabel(/Medida caseira de Frango/).selectOption({ index: 1 });
    await expect(page.getByLabel(/Gramas de Frango/)).toHaveValue("120");

    await page.getByRole("button", { name: /^5\s*Revisão/ }).click();
    await expect(page.getByText(/Fibras somadas parcialmente/)).toBeVisible();
    await expect(page.getByRole("region", { name: /Pré-visualização/ })).toContainText("Soma parcial");
  });

  test("/alimentos usa a base unificada com busca tolerante e '—' para não informado", async ({ page }) => {
    await page.goto("/alimentos");
    await expect(page.getByText(/602 alimentos/)).toBeVisible();
    await page.getByLabel("Pesquisar alimento").fill("frnago");
    await expect(page.locator("tbody tr td").first()).toContainText(/Frango/);
    await page.getByLabel("Pesquisar alimento").fill("whey");
    await page.getByRole("button", { name: /Selecionar Whey Protein Concentrado/ }).click();
    await expect(page.getByText(/scoop/).first()).toBeVisible();
  });
});
