import assert from "node:assert/strict";
import test from "node:test";

import { hasCosmeticsDataFailure } from "@/lib/cosmetics/data";

test("missing profile does not mark the cosmetics data as failed", () => {
  const failed = hasCosmeticsDataFailure({
    profileResult: { error: null },
    catalogResult: { error: null },
    inventoryResult: { error: null },
    parsedCatalog: { success: true },
    parsedInventory: { success: true },
  });

  assert.equal(failed, false);
});

test("real database errors still mark the cosmetics data as failed", () => {
  const failed = hasCosmeticsDataFailure({
    profileResult: { error: new Error("Missing table") },
    catalogResult: { error: null },
    inventoryResult: { error: null },
    parsedCatalog: { success: true },
    parsedInventory: { success: true },
  });

  assert.equal(failed, true);
});
