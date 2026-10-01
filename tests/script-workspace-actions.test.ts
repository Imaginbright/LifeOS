import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatScriptClipboardText } from "../src/lib/scripts/clipboard";

const scriptRoute = readFileSync(fileURLToPath(new URL("../src/app/api/scripts/[id]/route.ts", import.meta.url)), "utf8");
const templateRoute = readFileSync(fileURLToPath(new URL("../src/app/api/script-templates/[id]/route.ts", import.meta.url)), "utf8");
const templateServerData = readFileSync(fileURLToPath(new URL("../src/lib/scripts/server-data.ts", import.meta.url)), "utf8");

test("copy text contains only the script title and readable manuscript", () => {
  const text = formatScriptClipboardText("Laptop review", "HOOK\n\nA finished opening passage.\n\nTHE CATCH\nA practical tradeoff.");
  assert.equal(text, "Laptop review\n\nHOOK\n\nA finished opening passage.\n\nTHE CATCH\nA practical tradeoff.");
  assert.doesNotMatch(text, /Saved to Scripts|template_id|database ID|section navigation/i);
  assert.equal(formatScriptClipboardText("", "A titleless manuscript."), "A titleless manuscript.");
});

test("script and template deletes are owner-filtered and template deletion does not delete scripts", () => {
  for (const route of [scriptRoute, templateRoute]) {
    assert.match(route, /export async function DELETE/);
    assert.match(route, /\.delete\(\)[\s\S]*?\.eq\("id", id\)[\s\S]*?\.eq\("user_id", auth\.user\.id\)/);
  }
  assert.match(scriptRoute, /\.from\("scripts"\)/);
  assert.match(templateRoute, /\.from\("script_templates"\)/);
  assert.doesNotMatch(templateRoute, /\.from\("scripts"\)/);
  assert.doesNotMatch(templateServerData, /ensurePhoneReviewTemplate|phoneReviewTemplateSource/);
  assert.match(templateServerData, /item\.id !== phoneReviewId/);
});
