import { test } from "node:test";
import assert from "node:assert/strict";
import { parseScriptMarkdown } from "../src/lib/scripts/markdown-parser";
import { scriptTemplateInput } from "../src/lib/scripts/template-input";
import {
  scriptContentFromTemplate,
  createSavedTemplate,
  scriptManuscriptFromMarkdown,
  serializeVideoScriptSections,
  videoScriptSectionsFromStoredContent,
} from "../src/lib/scripts/templates";
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

test("YouTube and Shorts start with editable structured copies of every template section", () => {
  const source = "# Hook\n[OPEN — DESK B-ROLL]\n\nThe opening narration.\n\n## Why I bought it\nThe reason I chose it.";
  for (const type of ["longform", "shorts"] as const) {
    const snapshot = scriptContentFromTemplate(type, source);
    const parsed = JSON.parse(snapshot) as { version: number; format: string; sections: Array<{ id: string; title: string; visuals: string[]; body: string }> };
    assert.equal(parsed.version, 2);
    assert.equal(parsed.format, "video-sections");
    assert.deepEqual(parsed.sections.map(({ title }) => title), ["Hook", "Why I bought it"]);
    assert.deepEqual(parsed.sections[0].visuals, ["[OPEN — DESK B-ROLL]"]);
    assert.equal(parsed.sections[0].body, "The opening narration.");
    assert.equal(parsed.sections[1].body, "The reason I chose it.");

    parsed.sections[0].body = "Edited narration.";
    const afterSaveAndReload = videoScriptSectionsFromStoredContent(serializeVideoScriptSections(parsed.sections));
    assert.equal(afterSaveAndReload[0].title, "Hook");
    assert.equal(afterSaveAndReload[0].visuals[0], "[OPEN — DESK B-ROLL]");
    assert.equal(afterSaveAndReload[0].body, "Edited narration.");
  }
});

test("Blog template and script content stay raw MDX instead of going through the video parser", () => {
  const mdx = "# A Blog\n\n## Display\n\n<Component prop={{ value: true }} />\n\n```tsx\nexport default () => <p>source</p>;\n```";
  assert.equal(scriptContentFromTemplate("blog", mdx), mdx);
  assert.deepEqual(createSavedTemplate({ id: "blog-template", name: "MDX", type: "blog", sourceMarkdown: mdx }).sections, []);
});
