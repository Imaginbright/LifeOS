import { test, expect } from "@playwright/test";
import { mountWorkspace } from "./workspace-fixture";

test("typing near the middle of a long manuscript keeps the page and caret steady", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const content = Array.from({ length: 100 }, (_, index) => `Paragraph ${index + 1}. A passage to read and edit without scrolling inside separate boxes.`).join("\n\n");
    await page.route("**/api/scripts/*", (route) => route.fulfill({ json: { id: "saved" } }));
    await mountWorkspace(page, { content });
    const editor = page.getByRole("textbox", { name: "Script manuscript", exact: true });
    await expect(editor).toHaveValue(content);
    const position = content.indexOf("Paragraph 40.");
    await editor.evaluate((input: HTMLTextAreaElement, caret: number) => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(caret, caret);
      window.scrollTo(0, input.offsetTop + (input.scrollHeight * 0.39) - 200);
    }, position);
    const scroll = await page.evaluate(() => window.scrollY);
    await page.keyboard.type("Written here. ", { delay: 50 });
    expect(Math.abs(await page.evaluate(() => window.scrollY) - scroll)).toBeLessThan(40);
    await expect(editor).toHaveValue(content.slice(0, position) + "Written here. " + content.slice(position));
    await expect.poll(() => editor.evaluate((input: HTMLTextAreaElement) => input.selectionStart)).toBe(position + 14);
    await expect(page.locator(".script-save-state")).toHaveText("Saved");
    expect(Math.abs(await page.evaluate(() => window.scrollY) - scroll)).toBeLessThan(40);
    expect(await editor.evaluate((input: HTMLTextAreaElement) => input.scrollHeight <= input.clientHeight + 1)).toBe(true);
  }
});

test("mobile navigation stays out of writing screens and is available on the workspace", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mountWorkspace(page);
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  await expect(page.getByRole("link", { name: "YouTube", exact: true })).toBeVisible();
  await mountWorkspace(page, { path: "/scripts/youtube", screen: "create" });
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
});

test("Blog uses the same full document sizing and saves raw MDX", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const content = "# Working notes\n\n" + "<Component />\n\nA complete paragraph.\n\n".repeat(70);
  let saved = "";
  await page.route("**/api/scripts/*", async (route) => {
    saved = route.request().postDataJSON().content;
    await route.fulfill({ json: { id: "saved" } });
  });
  await mountWorkspace(page, { type: "blog", content });
  const editor = page.getByRole("textbox", { name: "MDX source", exact: true });
  await expect(editor).toHaveValue(content);
  expect(await editor.evaluate((input: HTMLTextAreaElement) => input.scrollHeight <= input.clientHeight + 1)).toBe(true);
  await editor.fill(content + "The final thought.");
  await expect.poll(() => saved).toBe(content + "The final thought.");
});

test("New script creates the selected medium without a template and reports failures", async ({ page }) => {
  for (const type of ["longform", "shorts", "blog"] as const) {
    let request: unknown;
    await page.route("**/api/scripts", async (route) => {
      request = route.request().postDataJSON();
      await route.fulfill({ json: { id: "new-draft" }, status: 201 });
    });
    await mountWorkspace(page, { type, screen: "create", path: "/scripts" });
    await page.getByRole("button", { name: "New script", exact: true }).click();
    await expect.poll(() => request).toEqual({ type });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __workspaceNavigation: string }).__workspaceNavigation)).toBe("/scripts/new-draft");
  }
  await page.route("**/api/scripts", (route) => route.fulfill({ status: 500, json: { error: "Unable to save this draft" } }));
  await mountWorkspace(page, { screen: "create", path: "/scripts" });
  await page.getByRole("button", { name: "New script", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Unable to save this draft");
  await expect(page.getByRole("button", { name: "New script", exact: true })).toBeEnabled();
});

test("first load waits for real dashboard data; refreshing keeps the current dashboard", async ({ page }) => {
  let release!: () => void;
  const dataDelay = new Promise<void>((resolve) => { release = resolve; });
  await mountWorkspace(page, { screen: "dashboard", path: "/dashboard", dataDelay });
  await expect(page.getByLabel("Loading your space")).toBeVisible();
  await expect(page.getByText("Good morning, You.")).toHaveCount(0);
  await expect(page.getByText("No goals yet.")).toHaveCount(0);
  release();
  await expect(page.getByRole("heading", { name: "Good morning, Bright." })).toBeVisible();
  await page.getByRole("button", { name: "Refresh fixture data" }).click();
  await expect(page.getByRole("heading", { name: "Good morning, Bright." })).toBeVisible();
  await expect(page.getByLabel("Loading your space")).toHaveCount(0);
});

test("leaving through the editor back link waits for the latest save", async ({ page }) => {
  let saved = "";
  await page.route("**/api/scripts/*", async (route) => {
    saved = route.request().postDataJSON().content;
    await route.fulfill({ json: { id: "saved" } });
  });
  await mountWorkspace(page, { content: "First thought." });
  await page.getByRole("textbox", { name: "Script manuscript", exact: true }).fill("A complete updated thought.");
  await page.getByRole("link", { name: "YouTube", exact: true }).click();
  await expect.poll(() => saved).toBe("A complete updated thought.");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __workspaceNavigation: string }).__workspaceNavigation)).toBe("/scripts/youtube");
});

test("a failed save keeps the manuscript open and can be retried", async ({ page }) => {
  let fail = true;
  let saved = "";
  await page.route("**/api/scripts/*", async (route) => {
    if (fail) {
      await route.fulfill({ status: 500, json: { error: "Unable to save" } });
    } else {
      saved = route.request().postDataJSON().content;
      await route.fulfill({ json: { id: "saved" } });
    }
  });
  await mountWorkspace(page, { content: "First thought." });
  const editor = page.getByRole("textbox", { name: "Script manuscript", exact: true });
  await editor.fill("Keep this latest thought.");
  await page.getByRole("link", { name: "YouTube", exact: true }).click();
  await expect(page.locator(".script-save-state")).toContainText("Save failed");
  expect(await page.evaluate(() => (window as unknown as { __workspaceNavigation?: string }).__workspaceNavigation)).toBeUndefined();
  await expect(editor).toHaveValue("Keep this latest thought.");
  fail = false;
  await page.getByRole("button", { name: "Retry saving" }).click();
  await expect(page.locator(".script-save-state")).toHaveText("Saved");
  expect(saved).toBe("Keep this latest thought.");
});

test("edits made while a navigation save is pending remain the latest saved version", async ({ page }) => {
  let release!: () => void;
  const firstSave = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  let stored = "";
  await page.route("**/api/scripts/*", async (route) => {
    const content = route.request().postDataJSON().content;
    if (++requests === 1) await firstSave;
    stored = content;
    await route.fulfill({ json: { id: "saved" } });
  });
  await mountWorkspace(page, { content: "First thought." });
  const editor = page.getByRole("textbox", { name: "Script manuscript", exact: true });
  await editor.fill("Version one.");
  await page.getByRole("link", { name: "YouTube", exact: true }).click();
  await expect.poll(() => requests).toBe(1);
  await editor.fill("Version two stays latest.");
  release();
  await expect(page.locator(".script-save-state")).toHaveText("Saved");
  expect(stored).toBe("Version two stays latest.");
  expect(await page.evaluate(() => (window as unknown as { __workspaceNavigation?: string }).__workspaceNavigation)).toBeUndefined();
});
