import { test } from "node:test";
import assert from "node:assert/strict";
import { mapSocial } from "../src/lib/data-mappers";
import { periodComparison, previousSyncComparison } from "../src/lib/social-history";
import type { Database } from "../src/lib/database.types";
import type { SocialSnapshot } from "../src/lib/types";

type Account = Database["public"]["Tables"]["connected_accounts"]["Row"];
type Snapshot = Database["public"]["Tables"]["social_snapshots"]["Row"];
const account = { id: "one", platform: "tiktok", status: "connected", display_name: "TikTok", granted_scopes: [] } as unknown as Account;
const row = (id: string, date: string, followers: number, connectedAccountId = "one") => ({ id, connected_account_id: connectedAccountId, provider: "tiktok", captured_at: date, followers }) as Snapshot;
const point = (date: string, followers: number, id = date): SocialSnapshot => ({ id, date, followers, platform: "tiktok" });

test("newest successful snapshot gives current value and previous sync gives Dashboard delta", () => {
  const data = mapSocial([account], [row("b", "2026-09-28T16:00:00Z", 2682), row("a", "2026-09-28T08:00:00Z", 2684)]);
  const card = data.socialAccounts.find((item) => item.platform === "tiktok")!;
  assert.equal(card.followers, 2682);
  assert.equal(card.previousFollowers, 2684);
  assert.equal(card.change, -2);
  assert.equal(card.comparisonAvailable, true);
});

test("Dashboard comparisons handle positive, negative, unchanged and one snapshot", () => {
  const earlier = point("2026-09-28T08:00:00Z", 10);
  assert.deepEqual(previousSyncComparison([earlier, point("2026-09-28T10:00:00Z", 18)]), { change: 8, label: "since last sync" });
  assert.equal(previousSyncComparison([earlier, point("2026-09-28T10:00:00Z", 8)])?.change, -2);
  assert.equal(previousSyncComparison([earlier, point("2026-09-28T10:00:00Z", 10)])?.change, 0);
  assert.equal(previousSyncComparison([earlier]), null);
});

test("Creator uses the 7D and 30D boundaries rather than the previous sync", () => {
  const history = [point("2026-08-29T00:00:00Z", 100), point("2026-09-21T00:00:00Z", 110), point("2026-09-27T00:00:00Z", 120), point("2026-09-28T00:00:00Z", 122)];
  const now = new Date("2026-09-28T12:00:00Z");
  assert.deepEqual(periodComparison(history, 7, "7D", now), { change: 12, label: "in 7D" });
  assert.deepEqual(periodComparison(history, 30, "30D", now), { change: 22, label: "in 30D" });
});

test("partial history is labeled with its actual start date", () => {
  const history = [point("2026-09-22T00:00:00Z", 100), point("2026-09-28T00:00:00Z", 99)];
  assert.deepEqual(periodComparison(history, 7, "7D", new Date("2026-09-28T12:00:00Z")), { change: -1, label: "since Sep 22" });
  const stale = [point("2026-09-01T00:00:00Z", 90), point("2026-09-10T00:00:00Z", 100)];
  assert.deepEqual(periodComparison(stale, 7, "7D", new Date("2026-09-28T12:00:00Z")), { change: 10, label: "since Sep 1" });
  const sparse = [point("2026-09-10T00:00:00Z", 80), point("2026-09-28T00:00:00Z", 100)];
  assert.deepEqual(periodComparison(sparse, 7, "7D", new Date("2026-09-28T12:00:00Z")), { change: 20, label: "since Sep 10" });
});

test("a newly synced snapshot changes UI values without a page reload", () => {
  const before = [row("a", "2026-09-28T08:00:00Z", 100)];
  const after = [...before, row("b", "2026-09-28T10:00:00Z", 104)];
  assert.equal(mapSocial([account], before).socialAccounts.find((item) => item.platform === "tiktok")?.comparisonAvailable, false);
  assert.equal(mapSocial([account], after).socialAccounts.find((item) => item.platform === "tiktok")?.followers, 104);
  assert.equal(mapSocial([account], after).socialAccounts.find((item) => item.platform === "tiktok")?.change, 4);
});

test("disconnected and old account snapshots do not leak into the active card", () => {
  const disconnected = mapSocial([], [row("old", "2026-09-28T10:00:00Z", 999)]).socialAccounts.find((item) => item.platform === "tiktok")!;
  assert.equal(disconnected.dataAvailable, false);
  const connected = mapSocial([account], [row("old", "2026-09-28T10:00:00Z", 999, "other")]).socialAccounts.find((item) => item.platform === "tiktok")!;
  assert.equal(connected.dataAvailable, false);
  const expired = mapSocial([{ ...account, status: "token_expired" }], [row("new", "2026-09-28T10:00:00Z", 105)]).socialAccounts.find((item) => item.platform === "tiktok")!;
  assert.equal(expired.followers, 105);
});

test("social cards keep YouTube, TikTok, Instagram order before Instagram is connected", () => {
  const cards = mapSocial([account], []).socialAccounts;
  assert.deepEqual(cards.map((item) => item.platform), ["youtube", "tiktok", "instagram"]);
  assert.equal(cards.at(-1)?.status, "not_connected");
});
