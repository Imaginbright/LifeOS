import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/tasks",
  "/goals",
  "/creator",
  "/subscriptions",
  "/inbox",
  "/calendar",
  "/settings",
];
test("every route renders without errors and fits desktop, tablet, and mobile widths", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 1024, 820, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} at ${width}px`).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});
test("task completion and quick additions stay consistent between pages", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("checkbox", { name: "Complete Finish dashboard design" })
    .check();
  await expect(
    page.getByRole("progressbar", { name: "Task completion" }),
  ).toHaveAttribute("aria-valuenow", "71");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill("Check the finished prototype");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add task", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Tasks", exact: true })
    .click();
  await expect(page.getByText("Check the finished prototype")).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Complete Finish dashboard design" }),
  ).toBeChecked();
  await page.getByRole("tab", { name: "monthly" }).click();
  await expect(
    page.getByRole("heading", { name: "September 2026" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "upcoming" }).click();
  await expect(page.getByText("2 overdue")).toBeVisible();
});
test("subscriptions support lists, manual currencies and custom billing", async ({
  page,
}) => {
  await page.goto("/subscriptions");
  await page.getByRole("tab", { name: "List", exact: true }).click();
  await expect(page.locator(".subscription-table-row")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Add subscription", exact: true })
    .click();
  await page.getByLabel("Service name").fill("Design library");
  await page.getByLabel("Amount", { exact: true }).fill("120");
  await page
    .getByRole("dialog")
    .getByRole("combobox", { name: "Currency", exact: true })
    .selectOption("USD");
  await page
    .getByRole("combobox", { name: "Billing cycle", exact: true })
    .selectOption("custom");
  await page.getByLabel("Days between payments").fill("365");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add subscription", exact: true })
    .click();
  await page.getByLabel("Subscription currency").selectOption("USD");
  await expect(
    page
      .getByRole("tabpanel", { name: "List" })
      .getByText("Design library", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".monthly-stat strong")).toHaveText("US$10");
  await page.getByRole("tab", { name: "Grid", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Design library" }),
  ).toBeVisible();
  await page.getByLabel("Subscription currency").selectOption("EUR");
  await expect(
    page.getByRole("heading", { name: "No subscriptions yet" }),
  ).toBeVisible();
});
test("goals can be added and updated, inbox can be read and cleared", async ({
  page,
}) => {
  await page.goto("/goals");
  await page.getByRole("button", { name: "Add goal", exact: true }).click();
  await page.getByLabel("Goal title").fill("Walk 100 kilometres");
  await page.getByLabel("Target value").fill("100");
  await page.getByLabel("Unit", { exact: true }).fill("km");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add goal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Update Walk 100 kilometres" })
    .click();
  await page.getByLabel("Current progress").fill("25");
  await page.getByRole("button", { name: "Save progress" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Walk 100 kilometres progress" }),
  ).toHaveAttribute("aria-valuenow", "25");
  await page.goto("/inbox");
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(
    page.getByRole("button", { name: "Mark all as read" }),
  ).toBeDisabled();
  const dismiss = page.getByRole("button", { name: /^Dismiss:/ });
  while (await dismiss.count()) await dismiss.first().click();
  await expect(
    page.getByRole("heading", { name: "You're all caught up." }),
  ).toBeVisible();
});
test("chart periods, calendar navigation, settings and keyboard dialog closing work", async ({
  page,
}) => {
  await page.goto("/creator");
  for (const period of ["7D", "30D", "3M", "6M", "1Y"]) {
    await page.getByRole("button", { name: period, exact: true }).click();
    await expect(
      page.getByRole("button", { name: period, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.goto("/calendar");
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(
    page.getByRole("heading", { name: "October 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page
    .getByRole("button", { name: "September 24, 2026, 1 events", exact: true })
    .click();
  await expect(
    page.getByText("Adobe Creative Cloud renewal", { exact: true }),
  ).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator('[data-theme="dark"]').first()).toBeVisible();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByLabel("Display name").fill("Bright");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good morning, Bright." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Quick add", exact: true }),
  ).toBeFocused();
});
test("mobile navigation opens sheets and exposes secondary routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(nav).toBeVisible();
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await nav.getByRole("button", { name: "Quick add and more pages" }).click();
  await page.getByRole("button", { name: /Add task Free up/ }).click();
  await page.getByLabel("Task title").fill("A mobile task");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add task", exact: true })
    .click();
  await nav.getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page.getByText("A mobile task")).toBeVisible();
  await nav.getByRole("button", { name: "Quick add and more pages" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Subscriptions" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your subscriptions." }),
  ).toBeVisible();
});
