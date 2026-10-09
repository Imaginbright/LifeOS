import { build } from "esbuild";
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import type { ScriptType } from "../../src/lib/types";

export const fixturePreferences = { appearance: "light", currency: "NGN", startOfWeek: "monday", notifications: true, name: "Bright", timezone: "Africa/Lagos" };
const appData = { tasks: [], goals: [], subscriptions: [], inbox: [], socialAccounts: [], socialSnapshots: [], connectedAccounts: [], preferences: fixturePreferences };
const css = readFileSync("src/app/globals.css", "utf8").replace('@import "tailwindcss";', "");
let bundle: Promise<string> | undefined;

function workspaceBundle() {
  bundle ??= build({
    bundle: true,
    write: false,
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    stdin: {
      loader: "tsx",
      resolveDir: process.cwd(),
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { ThemeProvider } from "./src/components/shared/theme-provider";
        import { AppProvider, useApp } from "./src/components/shared/app-provider";
        import { AppShell } from "./src/components/layout/app-shell";
        import { ScriptEditor } from "./src/components/scripts/script-editor";
        import { CreateScriptButton } from "./src/components/scripts/create-script-button";
        import { Dashboard } from "./src/components/dashboard/dashboard";
        const fixture = window.__workspaceFixture;
        function Content() {
          const app = useApp();
          if (fixture.screen === "appearance") return <button aria-label={app.resolvedAppearance === "dark" ? "Use light appearance" : "Use dark appearance"} onClick={() => app.setAppearance(app.resolvedAppearance === "dark" ? "light" : "dark")}>Appearance</button>;
          if (fixture.screen === "dashboard") return <><Dashboard /><button onClick={() => app.refresh()}>Refresh fixture data</button></>;
          if (fixture.screen === "create") return <CreateScriptButton type={fixture.type}>New script</CreateScriptButton>;
          return <ScriptEditor id="223b806e-0474-4eb8-8edb-41ed68f886f0" initialTitle="Working draft" initialContent={fixture.content} type={fixture.type} />;
        }
        createRoot(document.getElementById("root")).render(
          <ThemeProvider defaultTheme="light"><AppProvider initialPreferences={fixture.preferences}>
            <AppShell><Content /></AppShell>
          </AppProvider></ThemeProvider>
        );
      `,
    },
    plugins: [{
      name: "next-client-test-boundary",
      setup(builder) {
        builder.onResolve({ filter: /^next\/(link|navigation)$/ }, (args) => ({ path: args.path, namespace: "test-next" }));
        builder.onLoad({ filter: /.*/, namespace: "test-next" }, (args) => ({
          loader: "jsx",
          resolveDir: process.cwd(),
          contents: args.path === "next/link"
            ? 'import React from "react"; export default React.forwardRef(function Link({children, ...props}, ref) { return <a {...props} ref={ref}>{children}</a>; });'
            : 'export function usePathname() { return window.__workspaceFixture.path; } export function useRouter() { return { push(href) { window.__workspaceNavigation = href; }, replace(href) { window.__workspaceNavigation = href; }, refresh() {} }; }',
        }));
      },
    }],
  }).then((result) => result.outputFiles[0].text);
  return bundle;
}

export async function mountWorkspace(page: Page, options: { path?: string; content?: string; type?: ScriptType; screen?: "editor" | "dashboard" | "create" | "appearance"; dataDelay?: Promise<void> } = {}) {
  const script = await workspaceBundle();
  const { dataDelay, ...fixture } = options;
  await page.route("**/api/data", async (route) => {
    await dataDelay;
    await route.fulfill({ json: appData });
  });
  await page.route("**/api/profile", (route) => route.fulfill({ json: {} }));
  await page.route("**/workspace-fixture.js", (route) => route.fulfill({ contentType: "text/javascript", body: script }));
  await page.route("**/__workspace-fixture", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${css}</style></head><body><div id="root"></div><script>window.__workspaceFixture=${JSON.stringify({ path: "/scripts/223b806e-0474-4eb8-8edb-41ed68f886f0", content: "", type: "longform", screen: "editor", preferences: fixturePreferences, ...fixture }).replace(/</g, "\\u003c")}</script><script src="/workspace-fixture.js"></script></body></html>`,
  }));
  await page.goto("/__workspace-fixture");
}
