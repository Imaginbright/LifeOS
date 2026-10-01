import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isStaleScriptDraft, isStaleScriptTemplate, scriptManuscriptFromStoredContent } from "../src/lib/scripts/templates";

const foundationSql = readFileSync(fileURLToPath(new URL("../supabase/migrations/20261001090000_scripts_foundation.sql", import.meta.url)), "utf8");
const templatesSql = readFileSync(fileURLToPath(new URL("../supabase/migrations/20261001130000_script_templates.sql", import.meta.url)), "utf8");
const createScriptRoute = readFileSync(fileURLToPath(new URL("../src/app/api/scripts/route.ts", import.meta.url)), "utf8");
const editScriptRoute = readFileSync(fileURLToPath(new URL("../src/app/api/scripts/[id]/route.ts", import.meta.url)), "utf8");

test("old section-based drafts still open as readable manuscript text", () => {
  const legacy = JSON.stringify({
    version: 1,
    structure: [
      { id: "hook", title: "Hook", visualDirection: "OPEN — B-ROLL" },
      { id: "verdict", title: "Verdict" },
    ],
    sections: { hook: "My original narration.", verdict: "My conclusion." },
  });
  const manuscript = scriptManuscriptFromStoredContent(legacy);
  assert.match(manuscript, /Hook/);
  assert.match(manuscript, /\[OPEN — B-ROLL\]/);
  assert.match(manuscript, /My original narration/);
  assert.match(manuscript, /My conclusion/);
  assert.equal(scriptManuscriptFromStoredContent("Plain text manuscript"), "Plain text manuscript");
});

test("known temporary Playwright template and draft fixtures are kept out of the workspace", () => {
  assert.equal(isStaleScriptTemplate("Playwright ownership template", "# Hook\nSample"), true);
  assert.equal(isStaleScriptTemplate("Phone Review", "The Alder One is fictional."), true);
  assert.equal(isStaleScriptTemplate("Ownership Update", "# Opening\nMy own example."), false);
  assert.equal(isStaleScriptDraft("Playwright phone review"), true);
  assert.equal(isStaleScriptDraft("Untitled playwright ownership template"), true);
  assert.equal(isStaleScriptDraft("Samsung Galaxy review"), false);
});

test("existing scripts and templates tables retain user-owned row-level security", () => {
  for (const sql of [foundationSql, templatesSql]) {
    assert.match(sql, /enable row level security/i);
    assert.match(sql, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
    assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);
  }
  assert.match(createScriptRoute, /user_id:\s*auth\.user\.id/);
  assert.match(createScriptRoute, /\.eq\("user_id", auth\.user\.id\)/);
  assert.match(editScriptRoute, /\.eq\("user_id", auth\.user\.id\)/);
});
