import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createKnowledgeIndex, knowledgeContext } from "./knowledge-retrieval.js";
import { asksProtectedStoryQuestion } from "./spoiler-guard.js";

const knowledge = await readFile(new URL("./infernal-embrace-spoiler-free.md", import.meta.url), "utf8");
const index = createKnowledgeIndex(knowledge);

test("retrieves focused spoiler-free character knowledge", () => {
  const context = knowledgeContext(index, "Who is Lady Mircal?");
  assert.match(context, /Lady Mircal/);
  assert.ok(context.length <= 14_000);
});

test("retrieves setting knowledge without protected continuity", () => {
  const context = knowledgeContext(index, "Describe the Garden of Glass Roses");
  assert.match(context, /Garden of Glass Roses/);
  assert.doesNotMatch(context, /Piphex’s true nature/);
  assert.doesNotMatch(context, /PROTECTED CANON — NEVER VOLUNTEER/);
});

test("recognizes protected theories and outcomes before AI generation", () => {
  assert.equal(asksProtectedStoryQuestion("Confirm or deny my theory about Piphex"), true);
  assert.equal(asksProtectedStoryQuestion("Do Lilithra and Varkor end up together?"), true);
  assert.equal(asksProtectedStoryQuestion("Who is Lady Mircal?"), false);
});
