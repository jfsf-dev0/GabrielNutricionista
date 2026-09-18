import { expect, type Page } from "@playwright/test";

export const PATIENTS = {
  ana: { id: "pac-ana-lima", nome: "Ana Clara Lima" },
  carlos: { id: "pac-carlos-mendes", nome: "Carlos Mendes" },
  joao: { id: "pac-joao-freire", nome: "João Freire" },
};

/** Abre o app e devolve os tokens do portal gerados neste navegador (cada contexto tem os seus). */
export async function portalTokens(page: Page): Promise<Record<string, string>> {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.waitForFunction(() => {
    try { return JSON.parse(localStorage.getItem("gabriel_nutri_patients_v1") || "[]").every((p: { portalToken?: string }) => p.portalToken); } catch { return false; }
  });
  const pairs: [string, string][] = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("gabriel_nutri_patients_v1") || "[]").map((p: { id: string; portalToken: string }) => [p.id, p.portalToken]),
  );
  return Object.fromEntries(pairs);
}

/** Confirma o diálogo acessível do app (substitui window.confirm). */
export async function confirmDialog(page: Page, botao: RegExp | string = /Confirmar|Limpar plano|Importar|Remover/) {
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: botao }).click();
  await expect(dialog).toBeHidden();
}

export async function openBuilder(page: Page, idOrPlan: string) {
  await page.goto(`/planos/${idOrPlan}`);
  await expect(page.getByRole("region", { name: /Pré-visualização do relatório/ })).toBeVisible();
}

export async function pdfPages(page: Page): Promise<number> {
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await page.emulateMedia({ media: "screen" });
  const m = pdf.toString("latin1").match(/\/Count (\d+)/);
  return m ? Number(m[1]) : 0;
}
