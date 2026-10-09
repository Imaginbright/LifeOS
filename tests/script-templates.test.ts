import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { editableScriptManuscript, isStaleScriptDraft, isStaleScriptTemplate, scriptManuscriptFromStoredContent, videoScriptSectionsFromMarkdown, videoScriptSectionsFromStoredContent, videoScriptSectionsToMarkdown } from "../src/lib/scripts/templates";

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
  const editableSections = videoScriptSectionsFromStoredContent(legacy);
  assert.deepEqual(editableSections.map(({ title }) => title), ["Hook", "Verdict"]);
  assert.deepEqual(editableSections[0].visuals, ["OPEN — B-ROLL"]);
  assert.equal(editableSections[0].body, "My original narration.");
  assert.deepEqual(videoScriptSectionsFromStoredContent("Not JSON: a complete old manuscript").map(({ body }) => body), ["Not JSON: a complete old manuscript"]);
  assert.equal(videoScriptSectionsFromStoredContent('{"version":2,"format":"video-sections","sections":[null]}')[0].body.includes("video-sections"), true);
});

test("video drafts present stored sections as one continuous editable manuscript", () => {
  const stored = JSON.stringify({
    version: 2,
    format: "video-sections",
    sections: [
      { id: "hook", title: "Hook", visuals: ["[OPEN — CAMERA]"], body: "A complete opening." },
      { id: "verdict", title: "Verdict", visuals: [], body: "A clear conclusion." },
    ],
  });
  const manuscript = videoScriptSectionsToMarkdown(videoScriptSectionsFromStoredContent(stored));
  assert.equal(manuscript, "## Hook\n\n[OPEN — CAMERA]\n\nA complete opening.\n\n## Verdict\n\nA clear conclusion.");
  const sections = videoScriptSectionsFromMarkdown(manuscript);
  assert.deepEqual(sections.map(({ title }) => title), ["Hook", "Verdict"]);
  assert.deepEqual(sections[0].visuals, ["[OPEN — CAMERA]"]);
  assert.equal(sections[0].body, "A complete opening.");
  assert.equal(sections[1].body, "A clear conclusion.");
  assert.equal(editableScriptManuscript(stored), manuscript);
});

test("reopening a plain manuscript preserves exact text, cue positions, formatting, and whitespace", () => {
  const manuscript = "# Hook\n\nFirst line.\n\n[SHOW DETAIL]\n\n**Keep this emphasis.**\n\nLast line.\n";
  assert.equal(editableScriptManuscript(manuscript), manuscript);
  assert.equal(editableScriptManuscript("No heading.\n\nA second thought."), "No heading.\n\nA second thought.");
  assert.equal(editableScriptManuscript(""), "");
  assert.equal(editableScriptManuscript(null), "");
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

test("new script drafts accept a medium without requiring a template", () => {
  assert.match(createScriptRoute, /body\.type/);
  assert.match(createScriptRoute, /Choose a script type or template/);
  assert.match(createScriptRoute, /type:\s*scriptType/);
  assert.match(createScriptRoute, /template_id:\s*attachedTemplateId/);
  assert.match(createScriptRoute, /content,?\s*\n\s*\}/);
});
