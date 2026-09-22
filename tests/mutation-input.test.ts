import { test } from "node:test";
import assert from "node:assert/strict";
import { goalWrite, needsGoalCheckin, taskWrite } from "../src/lib/mutation-input";

test("task edits map daily and monthly dates to the correct columns", () => {
  const base = { title: "  Review plan  ", notes: "  bring notes  ", date: "2026-09-24", priority: "High", category: "Personal", scope: "daily" };
  assert.deepEqual(taskWrite(base), { title: "Review plan", notes: "bring notes", due_date: "2026-09-24", period_month: null, priority: "high", category: "Personal", scope: "daily" });
  assert.deepEqual(taskWrite({ ...base, scope: "monthly" }), { title: "Review plan", notes: "bring notes", due_date: null, period_month: "2026-09-01", priority: "high", category: "Personal", scope: "monthly" });
  assert.equal(taskWrite({ ...base, date: "2026-02-30" }), null);
});

test("goal edits validate progress and preserve supported fields", () => {
  const input = { title: "  Read more ", description: "A little each day", currentValue: 3, targetValue: 10, unit: "books", deadline: "2026-12-01", category: "Personal" };
  const values = goalWrite(input);
  assert.deepEqual(values, { title: "Read more", description: "A little each day", current_value: 3, target_value: 10, unit: "books", deadline: "2026-12-01", category: "Personal" });
  assert.equal(goalWrite({ ...input, currentValue: -1 }), null);
  assert.equal(needsGoalCheckin(2, 3), true);
  assert.equal(needsGoalCheckin(3, 3), false);
});
