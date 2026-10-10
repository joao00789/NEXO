import assert from "node:assert/strict";
import test from "node:test";

import { getStudyContent, studyContents } from "@/lib/content/catalog";

test("study library covers every ENEM area and links to complementary references", () => {
  const slugs = studyContents.map((content) => content.slug);
  const areas = new Set(studyContents.map((content) => content.area));

  assert.equal(new Set(slugs).size, studyContents.length);
  assert.ok(studyContents.length >= 50);
  assert.deepEqual(
    [...areas].sort(),
    [
      "Ciências Humanas",
      "Ciências da Natureza",
      "Linguagens",
      "Matemática",
      "Redação",
    ].sort(),
  );
  assert.ok(
    studyContents.every((content) =>
      content.resources?.some((resource) => resource.url.includes("wikipedia.org")),
    ),
  );
  assert.ok(
    studyContents.every(
      (content) => content.example.prompt.length >= 10 && content.example.solution.length >= 10,
    ),
  );
});

test("step-by-step essay guide has a complete writing and revision sequence", () => {
  const guide = getStudyContent("redacao-passo-a-passo");

  assert.ok(guide);
  assert.equal(guide.area, "Redação");
  assert.equal(guide.steps?.length, 7);
  assert.match(guide.steps?.[0].title ?? "", /recorte/i);
  assert.match(guide.steps?.at(-1)?.title ?? "", /revise/i);
});
