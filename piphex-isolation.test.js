import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Piphex cannot cross into Pip's separate world", async () => {
  const source = await readFile(new URL("./server.js", import.meta.url), "utf8");
  assert.match(source, /completely separate private system/);
  assert.match(source, /our paths do not cross/);
  assert.match(source, /crossesIntoPipWorld\(message\)/);
  assert.match(source, /\bSEPARATE_WORLD_REPLY\b/);
});
