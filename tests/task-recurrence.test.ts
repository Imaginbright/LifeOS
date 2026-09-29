import { test } from "node:test";
import assert from "node:assert/strict";
import { futureUncompleted, isOverdue, occurrenceDates, type RecurrenceRule } from "../src/lib/task-recurrence";
import { recurrenceWrite, taskWrite } from "../src/lib/mutation-input";

const rule = (changes: Partial<RecurrenceRule> = {}): RecurrenceRule => ({ frequency: "daily", interval: 1, weekdays: [], dayOfMonth: null, startsOn: "2026-09-28", endsOn: null, active: true, ...changes });

test("daily occurrences respect start and end boundaries", () => {
  assert.deepEqual(occurrenceDates(rule({ endsOn: "2026-09-30" }), "2026-09-27", "2026-10-02"), ["2026-09-28", "2026-09-29", "2026-09-30"]);
});

test("weekly Monday and multiple weekdays generate distinct occurrences", () => {
  assert.deepEqual(occurrenceDates(rule({ frequency: "weekly", weekdays: [1] }), "2026-09-28", "2026-10-12"), ["2026-09-28", "2026-10-05", "2026-10-12"]);
  assert.deepEqual(occurrenceDates(rule({ frequency: "weekly", weekdays: [1, 3, 5] }), "2026-09-28", "2026-10-04"), ["2026-09-28", "2026-09-30", "2026-10-02"]);
});

test("monthly dates clamp to the final valid day, including leap February", () => {
  assert.deepEqual(occurrenceDates(rule({ frequency: "monthly", startsOn: "2028-01-31", dayOfMonth: 31 }), "2028-01-31", "2028-03-31"), ["2028-01-31", "2028-02-29", "2028-03-31"]);
  assert.deepEqual(occurrenceDates(rule({ frequency: "monthly", startsOn: "2027-01-31", dayOfMonth: 31 }), "2027-01-31", "2027-03-31"), ["2027-01-31", "2027-02-28", "2027-03-31"]);
});

test("disabled series generates nothing and repeated generation gives the same unique dates", () => {
  assert.deepEqual(occurrenceDates(rule({ active: false }), "2026-09-28", "2026-10-01"), []);
  const first = occurrenceDates(rule(), "2026-09-28", "2026-10-01");
  const second = occurrenceDates(rule(), "2026-09-28", "2026-10-01");
  assert.deepEqual(first, second);
  assert.equal(new Set(first).size, first.length);
});

test("interval rules and end dates stay calendar-aware", () => {
  assert.deepEqual(occurrenceDates(rule({ interval: 2 }), "2026-09-28", "2026-10-03"), ["2026-09-28", "2026-09-30", "2026-10-02"]);
  assert.deepEqual(occurrenceDates(rule({ frequency: "weekly", interval: 2, weekdays: [1], endsOn: "2026-10-19" }), "2026-09-28", "2026-10-26"), ["2026-09-28", "2026-10-12"]);
  assert.deepEqual(occurrenceDates(rule({ frequency: "monthly", interval: 2, startsOn: "2026-01-31", dayOfMonth: 31 }), "2026-01-01", "2026-06-30"), ["2026-01-31", "2026-03-31", "2026-05-31"]);
});

test("recurrence input validates ownership-independent scheduling fields", () => {
  const base = { title: "Shoot video", notes: "", category: "Content", priority: "Medium", frequency: "weekly", interval: 1, startsOn: "2026-09-28", weekdays: [1], endsOn: null };
  assert.equal(recurrenceWrite(base)?.frequency, "weekly");
  assert.equal(recurrenceWrite({ ...base, weekdays: [] }), null);
  assert.equal(recurrenceWrite({ ...base, weekdays: [1, 1] }), null);
  assert.equal(recurrenceWrite({ ...base, endsOn: "2026-09-27" }), null);
});

test("missed occurrence stays overdue while completing another affects only that row", () => {
  const missed = { occurrenceDate: "2026-09-28", date: "2026-09-28", completed: false };
  const next = { occurrenceDate: "2026-10-05", date: "2026-10-05", completed: true };
  assert.equal(isOverdue(missed, "2026-09-29"), true);
  assert.equal(isOverdue(next, "2026-10-06"), false);
  assert.deepEqual(futureUncompleted([missed, next], "2026-09-28"), [missed]);
});

test("editing future series leaves completed and skipped history untouched", () => {
  const completed = { occurrenceDate: "2026-09-28", completed: true };
  const skipped = { occurrenceDate: "2026-10-05", completed: false, skipped: true };
  const future = { occurrenceDate: "2026-10-12", completed: false };
  assert.deepEqual(futureUncompleted([completed, skipped, future], "2026-10-05"), [future]);
  const one = taskWrite({ title: "One edited task", notes: "", category: "Content", priority: "Medium", scope: "daily", date: "2026-10-12", recurrenceId: "series" });
  assert.equal(one?.title, "One edited task");
  assert.equal("recurrence_id" in (one ?? {}), false);
});
