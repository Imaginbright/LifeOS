import { test } from "node:test";
import assert from "node:assert/strict";
import { crossedFollowerMilestones, followerDelta } from "../src/lib/integrations/social-metrics";
import { shouldRefreshToken } from "../src/lib/integrations/token-utils";
import { validOAuthState } from "../src/lib/integrations/oauth-state-utils";
import { dedupeInboxEvents, renewalEventKey } from "../src/lib/inbox-rules";
import { snapshotValues } from "../src/lib/integrations/persist";
import { settledSyncResults } from "../src/lib/integrations/sync";
import { ProviderError } from "../src/lib/integrations/errors";

test("follower deltas distinguish missing history from a real zero change", () => {
  assert.deepEqual(followerDelta(120, null), { change: null, percentage: null });
  assert.deepEqual(followerDelta(120, 120), { change: 0, percentage: 0 });
  assert.deepEqual(followerDelta(90, 100), { change: -10, percentage: -10 });
});

test("milestones include only meaningful thresholds crossed", () => {
  assert.deepEqual(crossedFollowerMilestones(950, 2050), [1000, 2000]);
  assert.deepEqual(crossedFollowerMilestones(2050, 1900), []);
});

test("token refresh uses the five minute safety window", () => {
  const now = Date.parse("2026-09-21T00:00:00Z");
  assert.equal(shouldRefreshToken("2026-09-21T00:04:59Z", now), true);
  assert.equal(shouldRefreshToken("2026-09-21T00:06:00Z", now), false);
  assert.equal(shouldRefreshToken(null, now), false);
});

test("OAuth state rejects missing, mismatched and different-length values", () => {
  assert.equal(validOAuthState("safe-state", "safe-state"), true);
  assert.equal(validOAuthState("safe-state", "unsafe-state"), false);
  assert.equal(validOAuthState(undefined, "safe-state"), false);
  assert.equal(validOAuthState("short", "much-longer"), false);
});

test("inbox rules create deterministic keys and remove duplicate events", () => {
  const key = renewalEventKey("subscription", "2026-09-28");
  assert.equal(key, "lifeos:subscription-renewal:subscription:2026-09-28");
  assert.deepEqual(dedupeInboxEvents([{ source_key: key, value: 1 }, { source_key: key, value: 2 }]), [{ source_key: key, value: 2 }]);
});

test("Instagram sync snapshots use normalized follower and media counts", () => {
  const row = snapshotValues("owner", "account", { provider: "instagram", providerUserId: "ig-1", displayName: "Bright", username: "bright", avatarUrl: null, followers: 2692, following: null, likes: null, videos: 48 }, "2026-09-29T08:00:00.000Z");
  assert.deepEqual(row, { connected_account_id: "account", user_id: "owner", provider: "instagram", followers: 2692, following: null, likes: null, videos: 48, captured_at: "2026-09-29T08:00:00.000Z" });
});

test("one provider failure does not replace successful sync results", () => {
  const results = settledSyncResults([{ platform: "youtube" }, { platform: "instagram" }], [
    { status: "fulfilled", value: { provider: "youtube", status: "success" } },
    { status: "rejected", reason: new ProviderError("provider_unavailable") },
  ]);
  assert.deepEqual(results, [{ provider: "youtube", status: "success" }, { provider: "instagram", status: "failed", error: "provider_unavailable" }]);
});

