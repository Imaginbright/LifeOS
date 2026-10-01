import { test } from "node:test";
import assert from "node:assert/strict";
import { parseScriptMarkdown } from "../src/lib/scripts/markdown-parser";
import { scriptTemplateInput } from "../src/lib/scripts/template-input";
import { scriptManuscriptFromMarkdown } from "../src/lib/scripts/templates";
import { phoneReviewManuscript } from "../src/lib/scripts/phone-review-manuscript";
import { scriptMedia } from "../src/lib/scripts/media";

test("YouTube is the public name for longform while Shorts and Blog stay separate media", () => {
  assert.deepEqual(scriptMedia.map(({ title }) => title), ["YouTube", "Shorts", "Blog"]);
  assert.equal(scriptMedia[0].type, "longform");
});

test("Markdown headings, all-caps headings, bold headings and visual cues stay in manuscript order", () => {
  const sections = parseScriptMarkdown([
    "## Hook",
    "[OPEN — TEST FOOTAGE]",
    "A finished opening passage.",
    "",
    "WHY I BOUGHT IT",
    "[OLD FOOTAGE / PURCHASE PHOTOS]",
    "The second passage.",
    "",
    "**The catch**",
    "A practical tradeoff.",
  ].join("\n"));

  assert.deepEqual(sections.map(({ title }) => title), ["Hook", "WHY I BOUGHT IT", "The catch"]);
  assert.match(sections[0].body, /\[OPEN — TEST FOOTAGE\]/);
  assert.match(sections[1].body, /\[OLD FOOTAGE \/ PURCHASE PHOTOS\]/);
  assert.equal(sections[1].visualDirection, "[OLD FOOTAGE / PURCHASE PHOTOS]");
  assert.match(sections[2].body, /A practical tradeoff/);
});

test("unheaded manuscript text becomes one safe section and malformed empty sections do not crash", () => {
  assert.deepEqual(parseScriptMarkdown("A continuous thought.\n\nA second paragraph."), [
    { id: "section-01-script", title: "Script", body: "A continuous thought.\n\nA second paragraph." },
  ]);
  assert.deepEqual(parseScriptMarkdown("  \n---\n# \n"), []);
  const emptySection = parseScriptMarkdown("# Hook\n\n## Verdict\nA conclusion.");
  assert.deepEqual(emptySection.map(({ title, body }) => ({ title, body })), [
    { title: "Hook", body: "" },
    { title: "Verdict", body: "A conclusion." },
  ]);
});

test("template validation accepts a user-owned YouTube manuscript and preserves the pasted source", () => {
  assert.equal(scriptTemplateInput({ name: " ", type: "longform", sourceMarkdown: "# Hook" }), null);
  assert.equal(scriptTemplateInput({ name: "Review", type: "video", sourceMarkdown: "# Hook" }), null);
  assert.equal(scriptTemplateInput({ name: "Review", type: "longform", sourceMarkdown: "  " }), null);
  const sourceMarkdown = "# Hook\n\nThe creator's own words.\n\n[OPEN — CAMERA]";
  assert.deepEqual(scriptTemplateInput({ name: " Review ", type: "longform", sourceMarkdown }), {
    name: "Review",
    type: "longform",
    sourceMarkdown,
  });
});

test("the canonical Phone Review manuscript converts into readable script text", () => {
  const sections = parseScriptMarkdown(phoneReviewManuscript);
  const draft = scriptManuscriptFromMarkdown(phoneReviewManuscript);
  assert.equal(sections[0].isOpening, true);
  assert.ok(sections.length >= 10);
  assert.ok(sections.some(({ title }) => title === "WHY I BOUGHT IT"));
  assert.ok(sections.some(({ title }) => title === "SO… WOULD I BUY IT AGAIN?"));
  assert.match(draft, /^“6 Months With the Lenovo Legion 5 — Would I Buy It Again\?”/);
  assert.match(draft, /\[OPEN — WARZONE \/ TASK MANAGER \/ AMD GPU USAGE\]/);
  assert.match(draft, /Six months ago, I spent my money on this\./);
  assert.match(draft, /Lenovo provides two DDR5 SODIMM slots/);
  assert.match(draft, /I stopped thinking of this as a gaming laptop that I also work on\./);
  assert.match(draft, /\[END\]/);
});

test("starting a script stores a text snapshot independent of later template edits", () => {
  const source = "## Hook\n\nThe original narration.\n\n## Verdict\nA real conclusion.";
  const snapshot = scriptManuscriptFromMarkdown(source);
  const changedTemplate = scriptManuscriptFromMarkdown("## Hook\n\nA rewritten template.");
  assert.match(snapshot, /The original narration/);
  assert.match(snapshot, /A real conclusion/);
  assert.doesNotMatch(snapshot, /#/);
  assert.doesNotMatch(snapshot, /A rewritten template/);
  assert.notEqual(snapshot, changedTemplate);
});
