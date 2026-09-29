import { test, expect } from "@playwright/test";

test("public pages render responsively without horizontal overflow", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/login", "/privacy", "/terms"]) {
      const response = await page.goto(route); expect(response?.status(), `${route} at ${width}px`).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `${route} overflows at ${width}px`).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});

test("protected pages redirect anonymous visitors to sign in", async ({ page }) => {
  for (const route of ["/dashboard", "/tasks", "/goals", "/creator", "/subscriptions", "/inbox", "/calendar", "/settings"]) {
    await page.goto(route); await expect(page).toHaveURL(/\/login\?next=/); await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  }
});

test("public landing page explains LifeOS and links to sign in and legal pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Life, a little more intentional." })).toBeVisible();
  for (const heading of ["Tasks", "Goals", "Subscriptions", "Creator"]) await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Legal navigation" }).getByRole("link", { name: "Privacy" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Legal navigation" }).getByRole("link", { name: "Terms" })).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
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

test("Dashboard social cards navigate to Creator while Creator cards stay inert", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dashboard");
    const dashboardCards = page.locator(".social-grid > a.social-card");
    await expect(dashboardCards).toHaveCount(3);
    for (const platform of ["TikTok", "Instagram", "YouTube"]) {
      const card = dashboardCards.filter({ hasText: platform });
      await expect(card).toHaveAttribute("href", "/creator");
      await expect(card.locator(".card-arrow")).toHaveCount(1);
    }
    await expect(page.locator(".social-grid > article.social-card")).toHaveCount(0);
    const dashboardTikTok = dashboardCards.filter({ hasText: "TikTok" });
    await dashboardTikTok.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(dashboardTikTok).toBeFocused();
    await expect(dashboardTikTok).toHaveCSS("outline-style", "solid");
    await dashboardTikTok.click();
    await expect(page).toHaveURL(/\/creator$/);

    const creatorCards = page.locator(".social-grid > article.social-card");
    await expect(creatorCards).toHaveCount(3);
    await expect(page.locator(".social-grid > a.social-card")).toHaveCount(0);
    await expect(creatorCards.locator("a")).toHaveCount(0);
    await expect(creatorCards.locator(".card-arrow")).toHaveCount(0);
    for (const platform of ["TikTok", "YouTube"]) {
      const card = creatorCards.filter({ hasText: platform });
      await expect(card).toHaveCSS("cursor", "auto");
      await card.hover();
      await expect(card).toHaveCSS("transform", "none");
      await card.click();
      await expect(page).toHaveURL(/\/creator$/);
    }
  }
});

test("manual social sync refreshes Dashboard and Creator without a hard reload", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const original = await page.evaluate(async () => (await fetch("/api/data", { cache: "no-store" })).json());
  const platform = (["youtube", "tiktok"] as const).find((item) => original.connectedAccounts.some((account: { platform: string; status: string }) => account.platform === item && account.status === "connected"));
  test.skip(!platform, "No connected creator account is available for the mocked sync test");
  const account = original.socialAccounts.find((item: { platform: string }) => item.platform === platform);
  const followers = account.followers + 5;
  const refreshed = {
    ...original,
    socialAccounts: original.socialAccounts.map((item: { platform: string }) => item.platform === platform ? { ...item, followers, previousFollowers: account.followers, change: 5, comparisonAvailable: true, dataAvailable: true } : item),
    socialSnapshots: [...original.socialSnapshots, { id: "mock-sync", platform, date: new Date().toISOString(), followers }],
  };
  await page.goto("/settings");
  await expect(page.getByRole("button", { name: "Sync now" }).first()).toBeVisible();
  await page.route("**/api/social/sync", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [{ provider: platform, status: "success" }] }) }));
  await page.route("**/api/data", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(refreshed) }));
  const response = page.waitForResponse((item) => item.url().endsWith("/api/data") && item.status() === 200);
  await page.getByRole("button", { name: "Sync now" }).first().click();
  await response;
  await page.getByRole("link", { name: "Dashboard", exact: true }).first().click();
  const expected = new Intl.NumberFormat("en-NG").format(followers);
  await expect(page.locator("a.social-card").filter({ hasText: account.displayName }).locator(".social-value")).toHaveText(expected);
  await page.getByRole("link", { name: "Creator", exact: true }).first().click();
  await expect(page.locator("article.social-card").filter({ hasText: account.displayName }).locator(".social-value")).toHaveText(expected);
});

test("weekly task series keeps separate occurrences through edit, completion, skip and stop", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + ((8 - date.getUTCDay()) % 7 || 7));
  const monday = date.toISOString().slice(0, 10);
  const title = `Shoot video ${Date.now()}`;
  const edited = `Plan video ${Date.now()}`;

  await page.goto("/tasks?view=upcoming");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill(title);
  await page.getByLabel("Date", { exact: true }).fill(monday);
  await page.getByLabel("Repeat").selectOption("weekly");
  await expect(page.getByRole("button", { name: "Monday" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("dialog").getByRole("button", { name: "Add task", exact: true }).click();
  let rows = page.locator(".task-row").filter({ hasText: title });
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(1);
  await page.reload();
  rows = page.locator(".task-row").filter({ hasText: title });
  expect(await rows.count()).toBeGreaterThan(1);

  await rows.first().getByRole("button", { name: `Actions for ${title}` }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByRole("radio", { name: "This and future tasks" }).check();
  await page.getByLabel("Task title").fill(edited);
  await page.getByRole("dialog").getByRole("button", { name: "Save task" }).click();
  rows = page.locator(".task-row").filter({ hasText: edited });
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(1);
  await rows.first().getByRole("checkbox").check();
  await expect(rows.first().getByRole("checkbox")).toBeChecked();
  await expect(rows.nth(1).getByRole("checkbox")).not.toBeChecked();

  await rows.nth(1).getByRole("button", { name: `Actions for ${edited}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Skip this task" }).click();
  expect(await rows.count()).toBeGreaterThan(1);
  await rows.nth(1).getByRole("button", { name: `Actions for ${edited}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("radio", { name: "Stop future tasks" }).check();
  await page.getByRole("button", { name: "Stop future tasks" }).click();
  await page.reload();
  await expect(page.locator(".task-row").filter({ hasText: edited })).toHaveCount(1);
});

test("authenticated changes persist after reload", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

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

  await page.goto("/dashboard");
  const title = `Playwright task ${Date.now()}`;
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill(title);
  await page.getByRole("dialog").getByRole("button", { name: "Add task", exact: true }).click();
  await page.goto("/tasks"); await expect(page.getByText(title)).toBeVisible();
  await page.reload(); await expect(page.getByText(title)).toBeVisible();
});

test("authenticated task and goal edits and deletions persist", async ({ page }) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "E2E owner credentials are not configured");
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open dashboard" }).first()).toBeVisible();
  await page.goto("/dashboard");
  const stamp = Date.now();
  const taskTitle = `Edit test task ${stamp}`;
  const editedTaskTitle = `Updated task ${stamp}`;
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill(taskTitle);
  await page.getByRole("dialog").getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByText(taskTitle)).toBeVisible();
  await page.getByRole("button", { name: `Actions for ${taskTitle}` }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Task title").fill(editedTaskTitle);
  await page.getByLabel("Notes").fill("A persisted note");
  await page.getByRole("dialog").getByRole("button", { name: "Save task" }).click();
  await expect(page.getByText(editedTaskTitle)).toBeVisible();
  await page.reload();
  await expect(page.getByText(editedTaskTitle)).toBeVisible();
  await page.getByRole("button", { name: `Actions for ${editedTaskTitle}` }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await expect(page.getByLabel("Notes")).toHaveValue("A persisted note");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: `Actions for ${editedTaskTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("heading", { name: "Delete task?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete task" }).click();
  await expect(page.getByText(editedTaskTitle)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(editedTaskTitle)).toHaveCount(0);

  const goalTitle = `Edit test goal ${stamp}`;
  const editedGoalTitle = `Updated goal ${stamp}`;
  await page.goto("/goals");
  await page.getByRole("button", { name: "Add goal", exact: true }).click();
  await page.getByLabel("Goal title").fill(goalTitle);
  await page.getByLabel("Target value").fill("10");
  await page.getByLabel("Unit").fill("sessions");
  await page.getByRole("dialog").getByRole("button", { name: "Add goal", exact: true }).click();
  await expect(page.getByText(goalTitle)).toBeVisible();
  await page.getByRole("button", { name: `Actions for ${goalTitle}` }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Goal title").fill(editedGoalTitle);
  await page.getByLabel("Current value").fill("3");
  await page.getByRole("dialog").getByRole("button", { name: "Save goal" }).click();
  await expect(page.getByText(editedGoalTitle)).toBeVisible();
  await page.reload();
  await expect(page.getByText(editedGoalTitle)).toBeVisible();
  await page.getByRole("button", { name: `Actions for ${editedGoalTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("heading", { name: "Delete goal?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete goal" }).click();
  await expect(page.getByText(editedGoalTitle)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(editedGoalTitle)).toHaveCount(0);
});
