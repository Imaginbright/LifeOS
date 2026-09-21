import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const [name, route, width, height] of [
  ["dashboard-desktop", "/", 1440, 1100],
  ["dashboard-mobile", "/", 390, 844],
  ["subscriptions-desktop", "/subscriptions", 1440, 1100],
  ["subscriptions-mobile", "/subscriptions", 390, 844],
  ["tasks-desktop", "/tasks", 1440, 1100],
  ["creator-desktop", "/creator", 1440, 1100],
  ["goals-mobile", "/goals", 390, 844],
  ["calendar-desktop", "/calendar", 1440, 1100],
  ["calendar-mobile", "/calendar", 390, 844],
  ["inbox-desktop", "/inbox", 1440, 1100],
  ["settings-desktop", "/settings", 1440, 1100],
  ["settings-mobile", "/settings", 390, 844],
  ["dashboard-tablet", "/", 820, 1100],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(`http://127.0.0.1:3000${route}`);
  await page.locator("h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `artifacts/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  console.log(`Captured ${name}`);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000/");
await page.getByRole("button", { name: "Quick add and more pages" }).click();
await page.getByRole("dialog").waitFor();
await page.screenshot({
  path: "artifacts/quick-add-mobile.png",
  animations: "disabled",
});
await browser.close();
