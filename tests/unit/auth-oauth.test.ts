import assert from "node:assert/strict";
import test from "node:test";

import { getSafeNextPath } from "@/lib/auth/oauth";

test("getSafeNextPath accepts internal application paths", () => {
  assert.equal(getSafeNextPath("/app?tab=progress"), "/app?tab=progress");
});

test("getSafeNextPath rejects external and protocol-relative URLs", () => {
  assert.equal(getSafeNextPath("https://example.com"), "/app");
  assert.equal(getSafeNextPath("//example.com"), "/app");
  assert.equal(getSafeNextPath(null), "/app");
});
