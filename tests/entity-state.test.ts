import { test } from "node:test";
import assert from "node:assert/strict";
import { removeEntity, replaceEntity } from "../src/lib/entity-state";

test("task update replaces only the saved task; delete updates completion counts", () => {
  const tasks = [{ id: "a", title: "Before", completed: false }, { id: "b", title: "Done", completed: true }];
  const edited = replaceEntity(tasks, { id: "a", title: "After", completed: false });
  assert.deepEqual(edited.map((task) => task.title), ["After", "Done"]);
  const remaining = removeEntity(edited, "b");
  assert.deepEqual(remaining.map((task) => task.title), ["After"]);
  assert.equal(remaining.filter((task) => task.completed).length, 0);
});

test("goal update replaces only the saved goal; delete removes its previews", () => {
  const goals = [{ id: "a", title: "First", currentValue: 1 }, { id: "b", title: "Second", currentValue: 2 }];
  const edited = replaceEntity(goals, { id: "a", title: "Updated", currentValue: 3 });
  assert.deepEqual(edited.map((goal) => goal.title), ["Updated", "Second"]);
  assert.deepEqual(removeEntity(edited, "a").map((goal) => goal.title), ["Second"]);
});
