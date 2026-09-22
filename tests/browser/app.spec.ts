import { test, expect } from "@playwright/test";

test("public pages render responsively without horizontal overflow", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/login", "/privacy", "/terms"]) {
      const response = await page.goto(route); expect(response?.status(), `${route} at ${width}px`).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `${route} overflows at ${width}px`).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});

test("protected pages redirect anonymous visitors to sign in", async ({ page }) => {
  for (const route of ["/", "/tasks", "/goals", "/creator", "/subscriptions", "/inbox", "/calendar", "/settings"]) {
    await page.goto(route); await expect(page).toHaveURL(/\/login\?next=/); await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  }
});

test("legal pages expose the support address and appearance control", async ({ page }) => {
  for (const route of ["/privacy", "/terms"]) {
    await page.goto(route);
    await expect(page.getByRole("link", { name: "brightified2004@gmail.com", exact: true })).toHaveAttribute("href", "mailto:brightified2004@gmail.com");
    await expect(page.locator(".sidebar")).not.toBeVisible();
  }
  await page.getByRole("button", { name: "Use dark appearance" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("appearance changes once per click and persists across reloads and routes", async ({ page }) => {
  await page.goto("/terms");
  await page.evaluate(() => localStorage.setItem("lifeos-theme", "light"));
  await page.reload();

  const root = page.locator("html");
  const darkToggle = page.getByRole("button", { name: "Use dark appearance" });
  await expect(root).toHaveClass(/light/);
  await expect(root).not.toHaveClass(/dark/);
  await expect(darkToggle).toBeVisible();

  await page.reload();
  await expect(root).toHaveClass(/light/);
  await expect(page.getByRole("button", { name: "Use dark appearance" })).toBeVisible();

  await page.getByRole("button", { name: "Use dark appearance" }).click();
  await expect(root).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Use light appearance" })).toBeVisible();

  await page.reload();
  await expect(root).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Use light appearance" })).toBeVisible();

  await page.goto("/privacy");
  await expect(root).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Use light appearance" }).click();
  await expect(root).toHaveClass(/light/);
  await expect(page.getByRole("button", { name: "Use dark appearance" })).toBeVisible();

  for (const expected of ["dark", "light", "dark", "light"] as const) {
    await page.getByRole("button", { name: `Use ${expected} appearance` }).click();
    await expect(root).toHaveClass(new RegExp(expected));
  }
});

test("system appearance resolves to the device theme without desynchronizing the toggle", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/terms");
  await page.evaluate(() => localStorage.setItem("lifeos-theme", "system"));
  await page.reload();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Use light appearance" })).toBeVisible();
  await page.getByRole("button", { name: "Use light appearance" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("authenticated changes persist after reload", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.goto("/terms");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Use light appearance" })).toBeVisible();
  await page.getByRole("button", { name: "Use light appearance" }).click();
  await page.goto("/settings");
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/");
  const title = `Playwright task ${Date.now()}`;
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill(title);
  await page.getByRole("dialog").getByRole("button", { name: "Add task", exact: true }).click();
  await page.goto("/tasks"); await expect(page.getByText(title)).toBeVisible();
  await page.reload(); await expect(page.getByText(title)).toBeVisible();
});
