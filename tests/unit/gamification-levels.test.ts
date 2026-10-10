import assert from "node:assert/strict";
import test from "node:test";

import { getLevelProgress } from "@/lib/gamification/levels";

test("calculates the next level and remaining XP for 195 XP", () => {
  assert.deepEqual(getLevelProgress(195), {
    level: 2,
    xpIntoLevel: 95,
    xpForNextLevel: 100,
    xpRemaining: 5,
    progressPercent: 95,
  });
});

test("advances a level at each 100 XP boundary", () => {
  assert.equal(getLevelProgress(99).level, 1);
  assert.equal(getLevelProgress(100).level, 2);
  assert.equal(getLevelProgress(200).level, 3);
});

test("treats invalid or negative XP as zero", () => {
  assert.equal(getLevelProgress(-1).level, 1);
  assert.equal(getLevelProgress(Number.NaN).xpRemaining, 100);
});
